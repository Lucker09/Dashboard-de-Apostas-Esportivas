import api from './api';

export const userService = {
    async getMyProfile() {
        const response = await api.get('/users/me');
        return response.data;
    }
};