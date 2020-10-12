const tagReg = {
    title: 'ti',
    artiist: 'ar',
    album: 'al',
    offset: 'offset',
    by: 'by'
};

const timeReg = /\[(\d{2,}):(\d{2,})(?:\.(\d{2,3}))?\]/g

const STATE_PLAY = 1,
    STATE_PAUSE = 0;

export default class Lyric {
    constructor(lrc, handler) {
        this.lrc = lrc;
        this.tags = {};
        this.lines = [];
        this.state = STATE_PAUSE;
        this.handler = handler;
        this.curNum = 0;

        this._init();
    }

    _init() {
        this._initTag();
        this._initLines();
    }

    _initTag() {
        for (let tag in tagReg) {
            // 相当于/\[ar:([^\]]*)\]/i,\是字符串里的特殊字符，字符串里需要用两个\才能表示出一个\
            const matches = this.lrc.match(new RegExp(`\\[${tagReg[tag]}:([^\\]]*)]`, 'i'))
            this.tags[tag] = matches && matches[1] || ''
        }
    }

    _initLines() {
        const lines = this.lrc.split('\n'),
            offset = parseInt(this.tags['offset']) || 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let res = timeReg.exec(line);
            if (res) {
                const txt = line.replace(timeReg, '').trim();
                if (txt) {
                    this.lines.push({
                        time: parseInt(res[1]) * 1000 * 60 + parseInt(res[2]) * 1000 + parseInt(res[3]),
                        txt
                    })
                }
            }
        }

        this.lines.sort((a, b) => a.time - b.time);
    }

    _findCurNum(time) {
        for (let i = 0; i < this.lines.length; i++) {
            if (time <= this.lines[i].time) {
                return i - 1;
            }
        }

        return this.lines.length - 1;
    }

    _callHandler(num) {

        const lineNum = num ? num : this.curNum + 1;

        if (lineNum < 0) return;

        this.handler({
            lineNum: lineNum,
            txt: this.lines[lineNum].txt
        })
    }

    _playRest() {
        let nextLine = this.lines[this.curNum + 1],
            delay = nextLine.time - (+new Date() - this.startTimeNode);  // 下一句歌词播放的延时时间

        this.timer = setTimeout(() => {
            this._callHandler();
            this.curNum++;
            this._playRest();
        }, delay);
    }

    play(offsetTime = 0) {
        if (!this.lines.length) return;

        this.state = STATE_PLAY;

        this.curNum = this._findCurNum(offsetTime);
        this.startTimeNode = +new Date() - offsetTime;  // 歌词开始的绝对时间节点

        this._callHandler(this.curNum);

        if (this.curNum < this.lines.length) {
            clearTimeout(this.timer);
            this._playRest();
        }
    }

    togglePlay() {
        const now = +new Date();

        if (this.state == STATE_PLAY) {
            this.state = STATE_PAUSE;
            clearTimeout(this.timer);
            this.pauseTimeNode = now;   // 歌词停止时的节点
        } else {
            this.state = STATE_PLAY;
            this.play(this.pauseTimeNode - this.startTimeNode);
        }
    }

    stop() {
        this.state = STATE_PAUSE;
        clearTimeout(this.timer);
    }
}