export const isLocalImage = (src: string) => src.startsWith('/');

export const isDataImage = (src: string) => src.startsWith('data:image/');

export const isUnsplashImage = (src: string) =>
  /(images|plus)\.unsplash\.com/i.test(src);

export const shouldUseNextImage = (src: string) =>
  isLocalImage(src) || isUnsplashImage(src);

