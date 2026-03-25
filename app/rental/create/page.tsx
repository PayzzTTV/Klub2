'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createRentalItem } from '@/lib/utils/inventory';
import type { InventoryCategory } from '@/types';
import { useToast } from '@/lib/hooks/useToast';

export default function CreateRentalPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast, ToastContainer } = useToast();

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    category: 'Son' as InventoryCategory,
    title: '',
    description: '',
    daily_price: '',
    quantity: '1',
    location: '',
    specifications: {
      marque: '',
      modele: '',
      etat: 'Excellent',
      annee: '',
      notes: ''
    }
  });

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUserId(user.id);
    }
    checkAuth();
  }, [supabase, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      toast.warning('Maximum 5 images autorisées');
      return;
    }

    // Vérifier la taille (max 5MB par image)
    const oversized = files.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.warning('Certaines images dépassent 5MB. Veuillez compresser vos images.');
      return;
    }

    setImageFiles([...imageFiles, ...files]);

    // Créer les previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Libérer la mémoire de l'ancien preview
    URL.revokeObjectURL(imagePreviews[index]);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUserId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('inventory-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error:', error);
          throw error;
        }

        // Récupérer l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('inventory-images')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Erreur lors de l\'upload des images. Veuillez réessayer.');
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.daily_price || !formData.location) {
      toast.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload des images
      const imageUrls = await uploadImages();

      // 2. Créer l'annonce
      const newItem = await createRentalItem(supabase, {
        owner_id: currentUserId,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        daily_price: parseFloat(formData.daily_price),
        quantity: parseInt(formData.quantity),
        location: formData.location,
        images: imageUrls,
        specifications: formData.specifications
      });

      if (newItem) {
        toast.success('Matériel ajouté avec succès !');
        router.push(`/rental/${newItem.id}`);
      }
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Erreur lors de la création. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const categories: InventoryCategory[] = ['Son', 'Image', 'Lumière', 'Logistique'];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
          >
            ← Retour
          </button>
          <h1 className="text-4xl font-bold mb-2">📦 Ajouter du Matériel</h1>
          <p className="text-gray-400">Mettez votre équipement en location sur KLUB</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Images Upload */}
          <div className="brutalist-card p-6">
            <h2 className="text-xl font-bold mb-4">📸 Photos du Matériel</h2>

            <div className="mb-4">
              <label className="brutalist-button cursor-pointer inline-block">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={imageFiles.length >= 5}
                />
                📷 Ajouter des Photos ({imageFiles.length}/5)
              </label>
              <p className="text-sm text-gray-400 mt-2">Max 5 images, 5MB chacune</p>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover border border-gray-800 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informations Principales */}
          <div className="brutalist-card p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">ℹ️ Informations Principales</h2>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium mb-2">Catégorie *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryCategory })}
                className="w-full bg-black border border-gray-800 rounded px-4 py-3 focus:outline-none focus:border-purple-500"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium mb-2">Titre de l&apos;annonce *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Kit Sonorisation JBL Pro"
                className="w-full bg-black border border-gray-800 rounded px-4 py-3 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez votre matériel, son état, ses caractéristiques..."
                rows={4}
                className="w-full bg-black border border-gray-800 rounded px-4 py-3 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Prix et Quantité */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Prix/jour (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.daily_price}
                  onChange={(e) => setFormData({ ...formData, daily_price: e.target.value })}
                  placeholder="150.00"
                  className="w-full bg-black border border-gray-800 rounded px-4 py-3 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quantité disponible *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded px-4 py-3 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium mb-2">Localisation *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Paris, Lyon, Marseille..."
                className="w-full bg-black border border-gray-800 rounded px-4 py-3 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          {/* Spécifications Techniques */}
          <div className="brutalist-card p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">⚙️ Spécifications Techniques</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Marque</label>
                <input
                  type="text"
                  value={formData.specifications.marque}
                  onChange={(e) => setFormData({
                    ...formData,
                    specifications: { ...formData.specifications, marque: e.target.value }
                  })}
                  placeholder="Ex: JBL, Shure, Robe..."
                  className="w-full bg-black border border-gray-800 rounded px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Modèle</label>
                <input
                  type="text"
                  value={formData.specifications.modele}
                  onChange={(e) => setFormData({
                    ...formData,
                    specifications: { ...formData.specifications, modele: e.target.value }
                  })}
                  placeholder="Ex: EON615, SM58..."
                  className="w-full bg-black border border-gray-800 rounded px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">État</label>
                <select
                  value={formData.specifications.etat}
                  onChange={(e) => setFormData({
                    ...formData,
                    specifications: { ...formData.specifications, etat: e.target.value }
                  })}
                  className="w-full bg-black border border-gray-800 rounded px-4 py-3 focus:outline-none focus:border-purple-500"
                >
                  <option value="Neuf">Neuf</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Bon">Bon</option>
                  <option value="Correct">Correct</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Année d&apos;achat</label>
                <input
                  type="text"
                  value={formData.specifications.annee}
                  onChange={(e) => setFormData({
                    ...formData,
                    specifications: { ...formData.specifications, annee: e.target.value }
                  })}
                  placeholder="Ex: 2023"
                  className="w-full bg-black border border-gray-800 rounded px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes techniques</label>
              <textarea
                value={formData.specifications.notes}
                onChange={(e) => setFormData({
                  ...formData,
                  specifications: { ...formData.specifications, notes: e.target.value }
                })}
                placeholder="Caractéristiques techniques, accessoires inclus, conditions de location..."
                rows={3}
                className="w-full bg-black border border-gray-800 rounded px-4 py-3 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="brutalist-button flex-1"
              disabled={loading || uploadingImages}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="brutalist-button bg-purple-600 hover:bg-purple-700 flex-1"
              disabled={loading || uploadingImages}
            >
              {loading ? '⏳ Création...' : uploadingImages ? '📤 Upload images...' : '✅ Publier l\'annonce'}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}
