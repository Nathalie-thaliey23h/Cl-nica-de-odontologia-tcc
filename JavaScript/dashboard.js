import { auth, db } from "./firebase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Busca agendamentos do usuário
    const lista = document.getElementById('lista-agendamentos');
    if (!lista) return;
    
    try {
        const q = query(collection(db, "agendamentos"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            lista.innerHTML = '<p style="text-align: center; padding: 20px;">Nenhum agendamento encontrado.</p>';
            return;
        }
        
        let html = '';
        querySnapshot.forEach((doc) => {
            const d = doc.data();
            html += `
                <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 5px solid #00b4d8;">
                    <strong>${d.servico}</strong> - ${d.data} às ${d.horario}<br>
                    <small>Status: ${d.status} | Telefone: ${d.telefone}</small>
                </div>
            `;
        });
        
        lista.innerHTML = html;
        
    } catch (error) {
        lista.innerHTML = '<p style="color: red;">Erro ao carregar agendamentos.</p>';
    }
});