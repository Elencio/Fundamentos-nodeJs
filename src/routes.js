import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';
import nodemailer from 'nodemailer';
import { authenticateUser } from './auth.js';

const database = new Database();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: 'caladojunior965@gmail.com',
    pass: 'ujhzcfbzfuagwdau'
  }
});


const sendPasswordEmail = async (userEmail, tempPassword) => {
  const mailOptions = {
    from: 'caladojunior965@gmail.com',
    to: userEmail,
    subject: 'Sua senha temporária para entrar no sistema',
    text: `Your temporary password is: ${tempPassword}`
  };
  
  console.log('Mail Options:', mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
  
};

const generateRandomPassword = () => {
  const length = 10; 
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }

  return password;
};



export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/users'),
    handler: (req, res) => {
      const { search } = req.query;

      const users = database.select('users', search ? {
        name: search,
        email: search
      } : null);

      return res.end(JSON.stringify(users));
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/users'),
    handler: (req, res) => {
      const { name, email } = req.body;

      const user = {
        id: randomUUID(),
        name,
        email,
        tempPassword: generateRandomPassword()
      };

      database.insert('users', user);

      sendPasswordEmail(user.email, user.tempPassword);

      return res.writeHead(201).end();
    }
  },
  {
    method: 'POST', 
    path: buildRoutePath('/login'),
    handler: (req, res) => {
      const { email, tempPassword } = req.body;

      if (authenticateUser(email, tempPassword)) {
        req.session.user = email; 
        res.redirect('/dashboard');
      } else {
        console.log('error')
      }
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/users/:id'),
    handler: (req, res) => {
      const { id } = req.params;
      const { name, email } = req.body;

      database.update('users', id, {
        name,
        email
      });

      return res.writeHead(204).end();
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/users/:id'),
    handler: (req, res) => {
      const { id } = req.params;

      database.delete('users', id);

      return res.writeHead(204).end();
    }
  }
];
