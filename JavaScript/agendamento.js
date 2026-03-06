import { auth, db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#form-agendamento");
    const mensagemDiv = document.querySelector("#mensagem");
    const btnSubmit = document.querySelector("#btnSubmit");

    if (!form) {
        console.error("Formulário não encontrado!");
        return;
    }

    // Função para mostrar mensagem
    function mostrarMensagem(tipo, texto) {
        if (!mensagemDiv) {
            alert(texto);
            return;
        }
        mensagemDiv.className = 'mensagem ' + tipo;
        mensagemDiv.innerHTML = texto;
        mensagemDiv.style.display = 'block';
        mensagemDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Verificar se usuário está logado
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // Se não estiver logado, redireciona para login
            mostrarMensagem('erro', '❌ Você precisa estar logado para agendar. Redirecionando...');
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
            
            // Desabilita o formulário
            form.querySelectorAll('input, select, textarea, button').forEach(el => {
                el.disabled = true;
            });
        } else {
            // Habilita o formulário
            form.querySelectorAll('input, select, textarea, button').forEach(el => {
                el.disabled = false;
            });
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = auth.currentUser;
        
        if (!user) {
            mostrarMensagem('erro', '❌ Você precisa estar logado para agendar.');
            return;
        }

        // Pegar valores dos campos
        const nome = document.querySelector("#nome")?.value || '';
        const email = document.querySelector("#email")?.value || '';
        const telefone = document.querySelector("#telefone")?.value || '';
        const data = document.querySelector("#data")?.value || '';
        const horario = document.querySelector("#horario")?.value || '';
        const servico = document.querySelector("#servico")?.value || '';
        const observacoes = document.querySelector("#observacoes")?.value || '';

        // Validações
        if (!nome || !email || !telefone || !data || !horario) {
            mostrarMensagem('erro', '❌ Preencha todos os campos obrigatórios.');
            return;
        }

        // Desabilitar botão
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '⏳ Enviando...';

        try {
            const docRef = await addDoc(collection(db, "agendamentos"), {
                servico: servico || "Não especificado",
                data: data,
                hora: horario,
                observacoes: observacoes,
                nomeContato: nome,
                emailContato: email,
                telefoneContato: telefone,
                usuarioId: user.uid,
                usuarioEmail: user.email,
                status: "agendado",
                criadoEm: serverTimestamp()
            });

            console.log("✅ Agendamento salvo com ID:", docRef.id);
            mostrarMensagem('sucesso', '✅ Agendamento confirmado! Redirecionando...');

            setTimeout(() => {
                window.location.href = "area_paciente.html";
            }, 1500);

        } catch (error) {
            console.error("❌ Erro:", error);
            mostrarMensagem('erro', `❌ Erro: ${error.message}`);
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = "Confirmar Agendamento";
        }
    });
});