const knex = require("../database/connection");
const User = require("./User");

class PasswordToken {
  async create(email) {
    const user = await User.findByEmail(email);

    if (user) {
      try {
        const token = Date.now();

        await knex
          .insert({
            token: token,
            user_id: user.id,
            used: 0,
          })
          .table("passwordtokens");

        return { status: true, token };
      } catch (error) {
        console.log(error);
        return { status: false, err: error };
      }
    } else {
      return {
        status: false,
        err: "O email passado não existe em nosso banco de dados!",
      };
    }
  }

  async validate(token) {
    try {
      const result = await knex
        .select()
        .where({ token: token })
        .table("passwordtokens");

      if (result.length) {
        const tk = result[0];

        if (tk.used) {
          return { status: false };
        } else {
          return { status: true, token: tk };
        }
      } else {
        return { status: false };
      }
    } catch (error) {
      return { status: false };
    }
  }

  async setUsed(token) {
    await knex
      .update({ used: 1 })
      .where({ token: token })
      .table("passwordtokens");
  }
}

module.exports = new PasswordToken();
