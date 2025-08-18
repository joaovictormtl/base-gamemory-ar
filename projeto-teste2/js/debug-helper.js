// Debug helper para A-Frame
(function() {
    // Espera o DOM carregar
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Debug helper carregado');
        
        // Adiciona evento para verificar se o raycaster está detectando elementos
        document.querySelector('[raycaster]').addEventListener('raycaster-intersection', function(e) {
            console.log('Raycaster intersecção detectada', e.detail.intersections);
        });
        
        // Adiciona evento para verificar quando um elemento é clicado
        document.addEventListener('click', (e) => {
            console.log('Elemento clicado:', e.target);
        });
        
        // Verificar se os elementos clickable estão sendo detectados
        setTimeout(() => {
            const clickables = document.querySelectorAll('.clickable');
            console.log(`Encontrados ${clickables.length} elementos clickable`);
        }, 3000);
    });
})();
