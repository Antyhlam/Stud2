const io = require('socket.io')({
    cors: {
        origin: ['http://localhost:3000']
    }
});
const fs = require('fs');

const THREADS_AMOUNT = 4;
const BYTES_PER_SECOND = 2;

const links = {
    pictures: [
        'file:///data/pictures/dea84d584888669b068a94d4f732156c.jpg',
        'file:///data/pictures/7a9ebe714be01a05afdbc1626335ffee.jpg',
        'file:///data/pictures/moraine-lake_3840x2400_zzss6.jpg',
    ],
    pdfs: [
        'file:///data/pdfs/document.pdf',
        'file:///data/pdfs/document2.pdf',
        'file:///data/pdfs/document3.pdf',
    ],
    documents: [
        'file:///data/documents/sample.docx',
        'file:///data/documents/sample2.docx',
        'file:///data/documents/sample3.docx',
    ]
}
const keys = Object.keys(links);

const downloaded = {};

io.on('connection', socket => {
    console.log(`connect: ${socket.id}`);
    downloaded[socket.id] = {}
    socket.emit('catalogs', keys);

    socket.on('disconnect', () => {
        console.log(`disconnect: ${socket.id}`);
    });

    socket.on('catalog', catalog => {
        console.log(catalog);
        if (keys.indexOf(catalog) === -1) {
            socket.emit('badCatalog', 'Не существует каталога ' + catalog);
        } else {
            socket.emit('catalogView', links[catalog]);
        }
    });

    socket.on('download', link => {
        let localLink = link.replace('file:///', './server/');
        downloaded[socket.id][link] = {size: fs.statSync(localLink).size, threads: {}};
        for (let i = 1; i <= THREADS_AMOUNT; i++) {
            downloaded[socket.id][link]['threads']['thread-' + i] = 0;
        }
    });

    setInterval(() => {
        let data = downloaded[socket.id];
        let progress = [];
        for (const [link, linkVal] of Object.entries(data)) {
            let size = linkVal['size'];
            let bytesPerSecond = Math.round(size / (THREADS_AMOUNT * BYTES_PER_SECOND));
            let sumPercent = 0;
            for (let [threadId, percent] of Object.entries(linkVal['threads'])) {
                linkVal['threads'][threadId] = percent + bytesPerSecond;
            }
            for (let [threadId, percent] of Object.entries(linkVal['threads'])) {
                sumPercent += percent;
            }
            progress.push({
                link: link,
                size: size,
                threads: THREADS_AMOUNT,
                progress: Math.round(sumPercent / (THREADS_AMOUNT * size) * 100)
            });
            for (const [threadId, percent] of Object.entries(linkVal['threads'])) {
                progress.push({link: null, size: null, threads: threadId, progress: Math.round(percent / size * 100)});
            }
            if (Math.round(sumPercent / (THREADS_AMOUNT * size) * 100) >= 100) {
                delete downloaded[socket.id][link];
                let localLink = link.replace('file:///', './server/');

                let fileData = fs.readFileSync(localLink).toString('hex');
                let data = []
                for (let i = 0; i < fileData.length; i += 2)
                    data.push('0x' + fileData[i] + '' + fileData[i + 1])
                let filename = localLink.split('/').pop();
                let extension = localLink.split('.').pop();
                let content = (extension === 'pdf') ? 'application/pdf' : (extension === 'doc') ? 'application/msword' : 'image/jpeg';
                io.emit('file', {filename: filename, content: content, data: data});
            }
        }
        if (progress.length) {
            io.emit('progress', progress);
        }
    }, 1000);
});

io.listen(3001);
