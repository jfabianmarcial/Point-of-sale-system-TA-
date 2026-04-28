const API = "http://localhost:3001/api";

const getToken = () => localStorage.getItem("token");

export const apiFetch = (url, options = {}) => {
  return fetch(`${API}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  }).then((r) => {
    if (r.status === 401) {
      localStorage.removeItem("token");
      window.location.reload();
    }
    return r.json();
  });
};