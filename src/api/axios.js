import axios from 'axios';

const instance = axios.create({
    header: {
        'Content-Type': 'multipart/form-data;charset=utf-8'
    },
    transformRequest: [
        function (data) {
            return data;
        }
    ]
})

export default instance;