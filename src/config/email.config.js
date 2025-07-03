module.exports = {
    email: {
        service: 'gmail', 
        user: process.env.EMAIL_USER || 'flippyexpress@gmail.com',
        pass: process.env.EMAIL_PASS || 'sua_senha_de_app_aqui',
        from: 'flippyexpress@gmail.com',
        to: 'flippyexpress@hotmail.com' 
    }
}; 