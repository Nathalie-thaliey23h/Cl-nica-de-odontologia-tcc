import { auth, db } from "./firebase-config.js";
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

//  MOSTRAR MENSAGEM 
function mostrarMensagem(tipo, texto) {
    const mensagem = document.getElementById('mensagem');
    if (mensagem) {
        mensagem.className = 'auth-message ' + tipo;
        mensagem.innerHTML = texto;
        mensagem.style.display = 'block';
    }
}

//  LIMPAR MENSAGEM 
function limparMensagem() {
    const mensagem = document.getElementById('mensagem');
    if (mensagem) {
        mensagem.style.display = 'none';
        mensagem.innerHTML = '';
    }
}

// CADASTRO 
const cadastroForm = document.getElementById('formCadastro');

if (cadastroForm) {
    cadastroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSubmit = cadastroForm.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit.innerHTML;

        limparMensagem();

        const nome = document.getElementById('nome')?.value;
        const email = document.getElementById('email')?.value;
        const telefone = document.getElementById('telefone')?.value;
        const senha = document.getElementById('senha')?.value;
        const confirmarSenha = document.getElementById('confirmarSenha')?.value;
        const termos = document.getElementById('termos')?.checked;

        if (!nome || nome.length < 3) {
            mostrarMensagem('error', '❌ Nome deve ter pelo menos 3 caracteres');
            return;
        }
        if (!email || !email.includes('@')) {
            mostrarMensagem('error', '❌ Email inválido');
            return;
        }
        if (!telefone || telefone.length < 10) {
            mostrarMensagem('error', '❌ Telefone inválido');
            return;
        }
        if (!senha || senha.length < 6) {
            mostrarMensagem('error', '❌ Senha deve ter pelo menos 6 caracteres');
            return;
        }
        if (senha !== confirmarSenha) {
            mostrarMensagem('error', '❌ As senhas não coincidem');
            return;
        }
        if (!termos) {
            mostrarMensagem('error', '❌ Você precisa aceitar os termos');
            return;
        }

        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '⏳ Cadastrando...';

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;

            await setDoc(doc(db, "usuarios", user.uid), {
                nome,
                email,
                telefone,
                criadoEm: new Date().toISOString(),
                uid: user.uid
            });

            mostrarMensagem('success', '✅ Cadastro realizado! Redirecionando...');

            setTimeout(() => {
                window.location.href = "area_paciente.html";
            }, 1500);

        } catch (error) {
            console.error("Erro:", error);
            let mensagemErro = error.message;
            if (error.code === 'auth/email-already-in-use') {
                mensagemErro = 'Este e-mail já está cadastrado';
            }
            mostrarMensagem('error', '❌ ' + mensagemErro);
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
        }
    });
}

// LOGIN
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnSubmit = loginForm.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit.innerHTML;

        limparMensagem();

        const email = document.getElementById('email')?.value;
        const senha = document.getElementById('senha')?.value;

        if (!email || !senha) {
            mostrarMensagem('error', '❌ Preencha todos os campos');
            return;
        }

        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '⏳ Entrando...';

        try {
            await signInWithEmailAndPassword(auth, email, senha);
            mostrarMensagem('success', '✅ Login realizado! Redirecionando...');

            setTimeout(() => {
                window.location.href = "area_paciente.html";
            }, 1200);

        } catch (error) {
            console.error("Erro:", error);
            let mensagemErro = error.message;
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                mensagemErro = 'E-mail ou senha incorretos';
            }
            mostrarMensagem('error', '❌ ' + mensagemErro);
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
        }
    });
}

// lOGOUT (será chamado da área do paciente) 
window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Erro no logout:", error);
        alert('Erro ao sair');
    }
};