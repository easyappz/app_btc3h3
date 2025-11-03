import instance from './axios';

// Attach an additional interceptor to surface user-friendly notifications
let attached = false;

function extractMessage(error) {
  const detail = error?.response?.data?.detail;
  const msg = error?.response?.data?.message;
  const status = error?.response?.status;
  if (typeof detail === 'string' && detail) return detail;
  if (typeof msg === 'string' && msg) return msg;
  if (status === 401) return 'Требуется авторизация.';
  if (status === 403) return 'Доступ запрещён.';
  if (status === 404) return 'Ресурс не найден.';
  return 'Произошла ошибка запроса. Попробуйте ещё раз.';
}

export function attachUserFriendlyInterceptor() {
  if (attached) return;
  instance.interceptors.response.use(
    (res) => res,
    (error) => {
      try {
        const message = extractMessage(error);
        const event = new CustomEvent('easyappz:notify', {
          detail: { type: 'error', message },
        });
        window.dispatchEvent(event);
      } catch (e) {
        // ignore
      }
      return Promise.reject(error);
    }
  );
  attached = true;
}

attachUserFriendlyInterceptor();
