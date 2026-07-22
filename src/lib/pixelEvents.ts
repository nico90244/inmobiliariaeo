/**
 * Envoltorios seguros para reportar eventos al TikTok Pixel.
 * Si el píxel aún no cargó (bloqueador de anuncios, red lenta, etc.)
 * estas funciones no rompen la app: simplemente no reportan nada.
 */

type ContentParams = {
  content_id?: string;
  content_name?: string;
  content_type?: string;
  value?: number;
  currency?: string;
};

export const trackViewContent = (params: ContentParams) => {
  window.ttq?.track("ViewContent", { currency: "COP", ...params });
};

export const trackContact = (params?: ContentParams) => {
  window.ttq?.track("Contact", params ? { currency: "COP", ...params } : undefined);
};

export const trackSubmitForm = (params?: ContentParams) => {
  window.ttq?.track("SubmitForm", params ? { currency: "COP", ...params } : undefined);
};
