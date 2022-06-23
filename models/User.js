const knex = require("../database/connection");
const bcrypt = require("bcrypt");
const PasswordToken = require("./PasswordToken");

class User {
  async findAll() {
    try {
      let result = await knex
        .select(["id", "name", "email", "role"])
        .table("users");
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async findById(id) {
    try {
      let result = await knex
        .select(["id", "name", "email", "role"])
        .where({ id: id })
        .table("users");

      if (result.length > 0) {
        return result[0];
      } else {
        return undefined;
      }
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async findByEmail(email) {
    try {
      let result = await knex
        .select(["id", "name", "password", "email", "role"])
        .where({ email: email })
        .table("users");

      if (result.length > 0) {
        return result[0];
      } else {
        return undefined;
      }
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async new(email, password, name, role = 0) {
    try {
      const hash = await bcrypt.hash(password, 10);

      const roleAtt = role;

      await knex
        .insert({ name: name, password: hash, email, role: roleAtt })
        .table("users");
    } catch (err) {
      console.log(err);
    }
  }

  async findEmail(email) {
    try {
      let result = await knex.select("*").from("users").where({ email: email });

      if (result.length > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async update(id, email, name, role) {
    const user = await this.findById(id);

    if (user !== undefined) {
      let editUser = {};

      if (email != undefined) {
        if (email != user.email) {
          const result = await this.findEmail(email);

          if (!result) {
            editUser.email = email;
          }
        } else {
          return { status: false, err: "O e-mail já está cadastrado." };
        }
      }

      if (name != undefined) {
        editUser.name = name;
      }

      if (role != undefined) {
        editUser.role = role;
      }

      try {
        await knex.update(editUser).where({ id: id }).table("users");
        return { status: true };
      } catch (error) {
        return { status: false, err: error };
      }
    } else {
      return { status: false, err: "O usuário não existe!" };
    }
  }

  async delete(id) {
    let user = await this.findById(id);

    if (user != undefined) {
      try {
        await knex.delete().where({ id: id }).table("users");
        return { status: true };
      } catch (error) {
        return { status: false, err: error };
      }
    } else {
      return { status: false, err: "Usuário não existe!" };
    }
  }

  async changePassword(newPassword, id, token) {
    const hash = await bcrypt.hash(newPassword, 10);

    try {
      await knex.update({ password: hash }).where({ id: id }).table("users");
      PasswordToken.setUsed(token);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new User();
