const btn = document.getElementById('generate_code');
btn.addEventListener('click', generateQR);

function generateQR(){
    const text = document.getElementById('data').value;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${text}`;
    document.getElementById('qr_img').src = url;
    const data = new FormData();
    data.append("json", JSON.stringify({dataName:text}));
    fetch('http://localhost:4040/users/new', {
        method: 'post', body: JSON.stringify({dataName:text}), headers:{"Content-Type": "application/json"}
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log(data);
    });
}
