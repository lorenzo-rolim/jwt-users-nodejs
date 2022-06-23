const User = require("../models/User");
const PasswordToken = require("../models/PasswordToken");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const secret = "sdapjfdposjaojfsoipjfaopsjfo";

class UserController {
  async index(req, res) {
    const users = await User.findAll();
    res.json(users);
  }

  async findUser(req, res) {
    const id = req.params.id;
    const user = await User.findById(id);

    if (user === undefined) {
      res.status(404);
      res.json({ err: "Não foi encontrado um usuário com este id" });
    } else {
      res.json(user);
    }
  }

  async create(req, res) {
    let { email, name, password, role } = req.body;

    if (email === undefined) {
      res.status(400);
      res.json({ err: "O email é inválido!" });
      return;
    }

    const emailExists = await User.findEmail(email);

    if (emailExists) {
      res.status(406);
      res.json({ err: "O email ja esta cadastrado!" });
      return;
    }
    await User.new(email, password, name, role);

    res.status(200);
    res.send("Pegando o corpo da requisição");
  }

  async edit(req, res) {
    const { id, name, role, email } = req.body;
    const result = await User.update(id, email, name, role);

    if (result !== undefined) {
      if (result.status) {
        res.status(200);
        res.send("Tudo Ok!");
      } else {
        res.status(406);
        res.json(result);
      }
    } else {
      res.status(406);
      res.json("Ocorreu um erro no servidor");
    }
  }

  async remove(req, res) {
    const id = req.params.id;

    const result = await User.delete(id);

    console.log(result);

    if (result.status) {
      res.status(200);
      res.send("Tudo OK!");
    } else {
      res.status(406);
      res.send(result.err);
    }
  }

  async recoverPassword(req, res) {
    const email = req.body.email;
    console.log(email);

    const result = await PasswordToken.create(email);
    console.log(result);

    if (result.status) {
      res.status(200);
      res.send("" + result.token.toString());
    } else {
      res.status(406);
      res.send(result.err);
    }
  }

  async changePassword(req, res) {
    let token = req.body.token;
    let password = req.body.password;

    const isTokenValid = await PasswordToken.validate(token);
    console.log(isTokenValid);

    if (isTokenValid.status) {
      console.log(isTokenValid);
      await User.changePassword(
        password,
        isTokenValid.token.user_id,
        isTokenValid.token.token
      );

      res.status(200);
      res.send("Senha alterada");
    } else {
      res.status(406);
      res.send("Token Inválido!");
    }
  }

  async login(req, res) {
    const { email, password } = req.body;

    let user = await User.findByEmail(email);

    if (user !== undefined) {
      const result = await bcrypt.compare(password, user.password);

      if (result) {
        let token = jwt.sign({ email: user.email, role: user.role }, secret);

        res.status(200);
        res.json({ token: token });
      } else {
        res.status(406);
        res.send("Senha incorreta");
      }
    } else {
      res.json({ status: false });
    }
  }
}

module.exports = new UserController();
