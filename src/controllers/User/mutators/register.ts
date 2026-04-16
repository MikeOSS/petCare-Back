import { CONFIG } from "@/core/config";
import database from "@/core/database";
import { Endpoint } from "@/core/server/endpoints/types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment";

type Body = {
  first_name: string;
  last_name: string;
  password: string;
};

type Params = {
  token: string;
};

const register: Endpoint = async (req, res) => {
  const body = req.body as Body;
  const params = req.params as Params;

  if (!CONFIG.SECURITY.JWT_SECRET) throw new Error("JWT secret not defined");

  let user = await database.user.findFirstOrThrow({
    where: { invite_token: params.token },
  });

  const password = await bcrypt.hash(body.password, 12);
  const email = user.email;

  user = await database.user.update({
    where: {
      id: user.id,
    },
    data: {
      first_name: body.first_name,
      last_name: body.last_name,
      invite_expire_date: null,
      invite_token: null,
      status: 'ACTIVE',
      password,
      email,
    },
  });

  const expireTime = moment().add(7, "days").toDate();

  // Create Session
  const session = await database.session.create({
    data: {
      user_id: user.id,
      expires_at: expireTime,
    },
  });

  // Create JWT Token with session data
  const payload = {
    role: user.role,
    sessionId: session.id,
  };

  const token = jwt.sign(payload, CONFIG.SECURITY.JWT_SECRET, {
    expiresIn: "7d",
  });

  return res
    .setCookie("token", token, {
      path: "/",
      httpOnly: true,
      sameSite: CONFIG.IS_DEV ? "strict" : "none",
      secure: CONFIG.IS_DEV ? false : true,
      domain: process.env.COOKIE_DOMAIN,
      expires: expireTime,
    })
    .send();
};

// Endpoint settings
register.httpMethod = "PUT";
register.path = "/register/:token";
register.isPublic = true;

export default register;
