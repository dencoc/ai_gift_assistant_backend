import nodemailer, { Transporter } from 'nodemailer'
import { AppError } from './AppError'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

export async function sendVerificationEmail(email: string, token: string) {
    if (email.length === 0 || token.length === 0) {
        throw { status: 422, message: 'E-mail и токен обязательны' }
    }

    const transporter: Transporter<SMTPTransport.SentMessageInfo> = nodemailer.createTransport({
        host: process.env.MAIL_SMTP,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
            user: process.env.MAIL_ADDRESS,
            pass: process.env.MAIL_PASSWORD2,
        },
    } as SMTPTransport.Options)

    const verificationLink = `${process.env.EMAIL_CONFIRM_URL}?token=${token}`

    const mailOptions = {
        from: `"Gift Assistant" <${process.env.MAIL_ADDRESS}>`,
        to: email,
        subject: 'Подтверждение электронной почты',
        text: `Здравствуйте!  
    
    Вы зарегистрировались в AI Gift Assistant. Для завершения регистрации подтвердите ваш email, перейдя по ссылке:  
    
    ${verificationLink}  
    
    Если вы не запрашивали регистрацию, просто проигнорируйте это сообщение.  
    
    С уважением,  
    Команда LoSoci`,
        html: `<p>Здравствуйте!</p>
                <p>Вы зарегистрировались в <b>Gift Assistant</b>. Для завершения регистрации подтвердите ваш email, нажав на кнопку ниже:</p>
                <p><a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Подтвердить Email</a></p>
                <p>Если вы не запрашивали регистрацию, просто проигнорируйте это сообщение.</p>
                <p>С уважением,<br>Команда LoSoci</p>`,
    }

    try {
        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.error('Error sending verification email:', error)
        throw new AppError('Error sending verification email', 500)
    }
}

export async function sendResetPasswordEmail(email: string, token: string) {
    if (email.length === 0 || token.length === 0) {
        throw { status: 422, message: 'E-mail и токен обязательны' }
    }

    const transporter: Transporter<SMTPTransport.SentMessageInfo> = nodemailer.createTransport({
        host: process.env.MAIL_SMTP,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
            user: process.env.MAIL_ADDRESS,
            pass: process.env.MAIL_PASSWORD,
        },
    } as SMTPTransport.Options)

    const verificationLink = `${process.env.EMAIL_RESET_PASSWORD_URL}?token=${token}`

    const mailOptions = {
        from: `"Gift Assistant" <${process.env.MAIL_ADDRESS}>`,
        to: email,
        subject: 'Восстановление пароля',
        text: `Здравствуйте!  
    
    Вы запросили восстановление пароля в Gift Assistant. Чтобы создать новый пароль, перейдите по следующей ссылке:  
    
    ${verificationLink}  
    
    Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.  
    
    С уважением,  
    Команда LoSoci`,
        html: `<p>Здравствуйте!</p>
                <p>Вы запросили <b>восстановление пароля</b> в <b>Gift Assistant</b>. Чтобы создать новый пароль, нажмите на кнопку ниже:</p>
                <p><a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Сбросить пароль</a></p>
                <p>Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>
                <p>С уважением,<br>Команда LoSoci</p>`,
    }

    try {
        await transporter.sendMail(mailOptions)
    } catch (error) {
        throw new AppError('Error sending reset password email', 500)
    }
}
