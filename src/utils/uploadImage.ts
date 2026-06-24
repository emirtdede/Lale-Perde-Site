export const uploadImageToServer = async (base64Str: string, folder: string = 'uploads'): Promise<string> => {
  try {
    const res = await fetch('/api/admin/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64: base64Str, folder }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Resim yüklenirken hata oluştu');
    }

    return data.url;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};
