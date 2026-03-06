import { auth, db } from "./firebase-config.js";
import { 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Verificar se o usuário está logado
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        // Se não estiver logado, redireciona para o login
        window.location.href = "login.html";
        return;
    }

    // Carregar dados do usuário
    await carregarDadosUsuario(user.uid);
    // Carregar agendamentos do usuário
    await carregarAgendamentos(user.uid);
});

// Função para carregar dados do usuário
async function carregarDadosUsuario(uid) {
    try {
        const userDoc = await getDoc(doc(db, "usuarios", uid));
        if (userDoc.exists()) {
            const dados = userDoc.data();
            document.getElementById('userName').textContent = dados.nome;
            document.getElementById('userEmail').textContent = dados.email;
            document.getElementById('userTelefone').textContent = dados.telefone;
            
            // Avatar com a primeira letra do nome
            const avatar = document.getElementById('userAvatar');
            avatar.textContent = dados.nome.charAt(0).toUpperCase();
        } else {
            // Fallback para dados do auth
            const user = auth.currentUser;
            document.getElementById('userName').textContent = user.email;
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userTelefone').textContent = '';
            document.getElementById('userAvatar').textContent = user.email.charAt(0).toUpperCase();
        }
    } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
    }
}

// Função para carregar agendamentos do usuário
async function carregarAgendamentos(uid) {
    try {
        const agendamentosRef = collection(db, "agendamentos");
        const q = query(
            agendamentosRef, 
            where("usuarioId", "==", uid),
            orderBy("data", "desc"),
            orderBy("hora", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        
        const proximosList = document.getElementById('proximos-list');
        const historicoList = document.getElementById('historico-list');
        
        proximosList.innerHTML = '';
        historicoList.innerHTML = '';
        
        if (querySnapshot.empty) {
            proximosList.innerHTML = '<div class="empty-message">Nenhum agendamento encontrado.</div>';
            historicoList.innerHTML = '<div class="empty-message">Nenhum histórico disponível.</div>';
            return;
        }

        const hoje = new Date().toISOString().split('T')[0];
        
        querySnapshot.forEach((docSnapshot) => {
            const dados = docSnapshot.data();
            const item = document.createElement('div');
            item.className = 'agendamento-item';
            
            // Formatar data
            const dataObj = new Date(dados.data + 'T12:00:00');
            const dataFormatada = dataObj.toLocaleDateString('pt-BR');
            
            // Determinar status
            let statusClass = 'status-agendado';
            let statusText = 'Agendado';
            
            if (dados.status === 'concluido') {
                statusClass = 'status-concluido';
                statusText = 'Concluído';
            } else if (dados.status === 'cancelado') {
                statusClass = 'status-cancelado';
                statusText = 'Cancelado';
            } else if (dados.data < hoje) {
                statusClass = 'status-concluido';
                statusText = 'Realizado';
            }
            
            item.innerHTML = `
                <div class="agendamento-info">
                    <div><i class="fas fa-calendar"></i> ${dataFormatada}</div>
                    <div><i class="fas fa-clock"></i> ${dados.hora}</div>
                    <div><i class="fas fa-briefcase"></i> ${dados.servico || 'Não especificado'}</div>
                </div>
                <span class="agendamento-status ${statusClass}">${statusText}</span>
            `;
            
            // Separar entre próximos (data >= hoje e status agendado) e histórico (data < hoje ou status diferente)
            if (dados.data >= hoje && dados.status !== 'cancelado' && dados.status !== 'concluido') {
                proximosList.appendChild(item);
            } else {
                historicoList.appendChild(item);
            }
        });
        
        // Se não houver próximos, mostrar mensagem
        if (proximosList.children.length === 0) {
            proximosList.innerHTML = '<div class="empty-message">Nenhum agendamento futuro.</div>';
        }
        if (historicoList.children.length === 0) {
            historicoList.innerHTML = '<div class="empty-message">Nenhum histórico.</div>';
        }
        
    } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
    }
}

// Alternar entre abas (opcional)
document.getElementById('verHistorico').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('proximos-section').style.display = 'none';
    document.getElementById('historico-section').style.display = 'block';
});

document.getElementById('verAgendamentos').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('proximos-section').style.display = 'block';
    document.getElementById('historico-section').style.display = 'none';
});