import instance from './axios';

export async function createConversation(payload) {
  const { data } = await instance.post('/api/chat/conversations/', payload);
  return data;
}

export async function listConversations(params = {}) {
  const { data } = await instance.get('/api/chat/conversations/', { params });
  return data;
}

export async function getConversation(id) {
  const { data } = await instance.get(`/api/chat/conversations/${id}/`);
  return data;
}

export async function listMessages(conversationId, params = {}) {
  const { data } = await instance.get(`/api/chat/conversations/${conversationId}/messages/`, { params });
  return data;
}

export async function sendMessage(conversationId, payload) {
  const { data } = await instance.post(`/api/chat/conversations/${conversationId}/messages/`, payload);
  return data;
}

export default {
  createConversation,
  listConversations,
  getConversation,
  listMessages,
  sendMessage,
};
