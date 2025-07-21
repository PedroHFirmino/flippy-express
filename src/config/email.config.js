module.exports = {
    email: {
        service: 'gmail', 
        user: process.env.EMAIL_USER || 'flippyexpress@gmail.com',
        pass: process.env.EMAIL_PASS || '',
        from: 'flippyexpress@gmail.com',
        to: 'flippyexpress@hotmail.com' 
    }
}; 