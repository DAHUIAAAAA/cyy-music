import md5 from 'js-md5';
import instance from './axios';

const baseUrl = 'http://127.0.0.1:3000'

/* 已发送列表，记录上传进度。以及正在上传的文件；
1表示正在上传，
http://xxxx表示传输完毕，

sendList = {

    343354: {
        5708f7ee86e712ee8c5af6c67f1b3642: File, 
        acde600708db9b06c00a7707c3db27a8: http://xxxx/acde600708db9b06c00a7707c3db27a8.mp3, 
        475b6e097c3447d8653ff50ff5d63691: File, 
        38d95fb56c6cef257555f33d3440babb: File, 
        7e72167c88c2049763ca806021b18596: http://xxxx/7e72167c88c2049763ca806021b18596.mp3
    }
    
}
*/
let sendList = {};

// 显示文件上传进度
let progress = {};
let currentFileSize = 0;
let currentUploadSize = 0;
let currentRate = 0;

// 获取vue实例
let _vm = null;

let proxy = createProxyObj();
let queue = { length: 0 };

function createProxyObj() {
    let obj = new Proxy({ length: 0 }, {
        set(target, key, value) {
            if (target['length'] === 0 && queue.length === 0) {
                if (value > 0) {
                    queue.length = value;
                    uploadAllFile(value);
                }
                return true;
            } else {
                queue.length = value;
                return true;
            }
        }
    })

    return obj;
}

function readFileMD5(files) {
    // 文件的MD5
    let fileKey = {};
    let asyncList = [];
    let count = 0;

    return new Promise((resolve, reject) => {
        for (let i = 0; i < files.length; i++) {
            let fd = new FileReader();
            fd.readAsBinaryString(files[i]);
            fd.addEventListener('load', e => {

                const buf = e.target.result;
                const fileMD5 = md5(buf);
                fileKey[fileMD5] = files[i];

                count++;
                if (count === files.length) {
                    resolve(fileKey);
                }
            });
        }
    });


}

function getFilesByMD5(keys) {
    return new Promise((resolve, reject) => {
        instance
            .post('/api/getFilesByMD5', { md5Key: keys })
            .then(res => {
                resolve(res.data);
            })
    })
}

function getChunk(file) {

    const chunkSize = 2097152 //2M
    const chunkCount = Math.ceil(file.size / chunkSize);

    let chunkList = []
    let currentChunk = 0;
    let current = 0;
    while (current < chunkCount) {
        let chunk = file.slice(current * chunkSize, (current + 1) * chunkSize);
        chunkList.push(chunk);
        current++;
    }
    return chunkList;
}

/*
0表示该歌单没有这首歌，可以上传
http://xxx/ssdsdwefewc.mp3,表示服务器已经有这首歌曲，秒传，

res = {
    5708f7ee86e712ee8c5af6c67f1b3642: 0, 
    acde600708db9b06c00a7707c3db27a8: http://xxxx/acde600708db9b06c00a7707c3db27a8.mp3, 
    475b6e097c3447d8653ff50ff5d63691: 0, 
    38d95fb56c6cef257555f33d3440babb: 0, 
    7e72167c88c2049763ca806021b18596: http://xxxx/7e72167c88c2049763ca806021b18596.mp3
}
*/
export async function pushFileToQueue(mid, files, vm) {

    _vm = vm;

    const fileKey = await readFileMD5(files);

    // 查找sendList剔除不需要上传的歌曲
    if (sendList[mid]) {
        for (let key in fileKey) {
            if (sendList[mid][key]) {
                fileKey[key] = 0;
            } else {
                sendList[mid][key] = fileKey[key];
            }
        }
    } else {
        let copyFileKey = Object.assign({}, fileKey);
        sendList[mid] = copyFileKey;
    }

    let md5Key = [];

    for (let key in fileKey) {
        if (fileKey[key]) {
            md5Key.push(key)
        }
    }

    if (!md5Key.length) return;

    // let res = await getFilesByMD5(md5Key);



    let res = {
        '5708f7ee86e712ee8c5af6c67f1b3642': 0,
        'acde600708db9b06c00a7707c3db27a8': 'http://xxxx/acde600708db9b06c00a7707c3db27a8.mp3',
        '475b6e097c3447d8653ff50ff5d63691': 0,
        '38d95fb56c6cef257555f33d3440babb': 0,
        '7e72167c88c2049763ca806021b18596': 'http://xxxx/7e72167c88c2049763ca806021b18596.mp3',
        "9072e00fdef0043d741c8e86e876f5fa": 0
    }

    // 更新sendList
    for (let key in res) {
        if (res[key] && fileKey[key]) {
            sendList[mid][key] = res[key]; // http://xxxx
            fileKey[key] = res[key];
        } else if (fileKey[key]) {
            fileKey[key] = 1;
        }
    }
    console.log(fileKey)
    // 文件切片
    for (let key in fileKey) {

        if (fileKey[key] === 1) {

            let oneFileAllChunk = [];
            const chunkList = getChunk(sendList[mid][key]);

            chunkList.forEach((item, index) => {
                let form = new FormData();
                form.append("mid", mid);
                form.append("chunk", item);
                form.append("chunkID", index);
                form.append("fileName", fileKey[key].name);
                form.append("fileMD5", key);

                oneFileAllChunk.push(form);
            });

            const queueLen = proxy.length;

            // /*
            // key: 每个文件的md5码，
            // oneFileAllChunk: 文件的全部切片(FormData对象)
            // size: 每个文件的总大小
            // */
            console.log(sendList[mid][key])
            queue[queueLen + 1] = {
                key,
                oneFileAllChunk,
                size: sendList[mid][key].size
            };

            proxy.length++;

        }
    }
}

async function uploadAllFile() {

    // 循环队列，分别上传任务队列中的文件
    for (let i = 1; i <= queue.length; i++) {
        currentFileSize = queue[i].size;
        const fileKey = queue[i].key;
        const allChunk = queue[i].oneFileAllChunk;

        const sendChunk = createSendChunkFn(fileKey, allChunk);

        await sendChunk();

        if (i === queue.length) {
            proxy.length = 0;
        }
    }
}

function createSendChunkFn(fileKey, allChunk) {
    let axiosArr = [];
    return function () {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < allChunk.length; i++) {
                const chunk = allChunk[i];

                const config = {
                    header: {
                        'Content-Type': "multipart/form-data;charset=utf-8"
                    },
                    onUploadProgress: e => {
                        if (e.lengthComputable) {
                            const currentChunk = chunk.get("chunkID");
                            progress[currentChunk] = e.loaded;

                            currentUploadSize = 0;

                            for (let key in progress) {
                                currentUploadSize += progress[key];
                            }
                            currentRate = currentUploadSize / currentFileSize * 100 | 0;

                            if (currentRate < 100) {
                                _vm.uploadRate = currentRate;
                            }
                        }
                    }
                }
                axiosArr.push(
                    instance.post(baseUrl + "/api/uploadChunk", chunk, config)
                )
            }

            resolve()

            // Promise.all(axiosArr).then(res => {
            //     instance.post("/api/uploadMerge", fileKey).then(res => {
            //         if (res.code == 0) {
            //             resolve();
            //         }
            //     })
            // })
        })
    }
}