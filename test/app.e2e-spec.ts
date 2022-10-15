import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

import { AppModule } from "../src/app.module";

type UserInfoResponse = {
  name: string;
  username: string;
  roles: string[];
  iat: number;
  exp: number;
};

describe("Route test", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe("Public routes", () => {
    describe("/ (GET)", () => {
      test("Public route returning OK response with message", () => {
        return request(app.getHttpServer())
          .get("/")
          .expect(200)
          .expect("Greetings EVERYONE!");
      });
    });
  });

  describe("Guarded routes", () => {
    const validAdminCredentials = {
      username: "adminAlice",
      password: "alice_password",
    };

    const validUserCredentials = {
      username: "userBob",
      password: "bob_password",
    };

    let validAdminToken = "";
    let validUserToken = "";
    const invalidToken = "INVALID.ACCESS.TOKEN";

    describe("/auth/login (POST)", () => {
      const ENDPOINT = "/auth/login";
      test("Given valid admin credentials, expect 200", async () => {
        const expectedAdminResponse = {
          username: validAdminCredentials.username,
          tokenValidity: 300,
        };

        await request(app.getHttpServer())
          .post(ENDPOINT)
          .send(validAdminCredentials)
          .expect(201)
          .expect((res) => {
            validAdminToken = res.body["access_token"];
            const { username, iat, exp } = parseJwt(validAdminToken);
            expect(username).toBe(expectedAdminResponse.username);
            expect(exp - iat).toBe(expectedAdminResponse.tokenValidity);
          });
      });

      test("Given valid user credentials, expect 200", async () => {
        const expectedUserResponse = {
          username: validUserCredentials.username,
          tokenValidity: 300,
        };

        await request(app.getHttpServer())
          .post(ENDPOINT)
          .send(validUserCredentials)
          .expect(201)
          .expect((res) => {
            validUserToken = res.body["access_token"];
            const { username, iat, exp } = parseJwt(validUserToken);
            expect(username).toBe(expectedUserResponse.username);
            expect(exp - iat).toBe(expectedUserResponse.tokenValidity);
          });
      });

      test("Given invalid credentials, expect 401", () => {
        const invalidCredentails = {
          username: "adminAlice",
          password: "INVALID_PASSWORD",
        };

        return request(app.getHttpServer())
          .post(ENDPOINT)
          .send(invalidCredentails)
          .expect(401);
      });
    });

    describe("/me (GET)", () => {
      const ENDPOINT = "/me";
      test("Given valid admin token, expect 200", () => {
        return request(app.getHttpServer())
          .get(ENDPOINT)
          .set("Authorization", `Bearer ${validAdminToken}`)
          .expect(200)
          .expect({ ...parseJwt(validAdminToken) });
      });

      test("Given valid user token, expect 200", () => {
        return request(app.getHttpServer())
          .get(ENDPOINT)
          .set("Authorization", `Bearer ${validUserToken}`)
          .expect(200)
          .expect({ ...parseJwt(validUserToken) });
      });

      test("Given invalid token, expect 401", () => {
        return request(app.getHttpServer())
          .get(ENDPOINT)
          .set("Authorization", `Bearer ${invalidToken}`)
          .expect(401);
      });
    });

    describe("/profile/:username (GET)", () => {
      const ENDPOINT = (username: string) => {
        return `/profile/${username}`;
      };
      const validUsername = "unknown";
      const invalidUsername = "INVALID_USERNAME";
      const expectedValidResponse: Omit<UserInfoResponse, "iat" | "exp"> = {
        name: "John Doe",
        username: "unknown",
        roles: ["user"],
      };

      describe("Given valid admin token", () => {
        test("Check valid username, expect 200", () => {
          return request(app.getHttpServer())
            .get(ENDPOINT(validUsername))
            .set("Authorization", `Bearer ${validAdminToken}`)
            .expect(200)
            .expect(expectedValidResponse);
        });

        test("Check invalid username, expect 404", () => {
          return request(app.getHttpServer())
            .get(ENDPOINT(invalidUsername))
            .set("Authorization", `Bearer ${validAdminToken}`)
            .expect(404);
        });
      });

      describe("Given valid user token", () => {
        test("Check valid username, expect 403", () => {
          return request(app.getHttpServer())
            .get(ENDPOINT(validUsername))
            .set("Authorization", `Bearer ${validUserToken}`)
            .expect(403);
        });
        test("Check invalid username, expect 403", () => {
          return request(app.getHttpServer())
            .get(ENDPOINT(invalidUsername))
            .set("Authorization", `Bearer ${validUserToken}`)
            .expect(403);
        });
      });

      describe("Given invalid token", () => {
        test("Check valid username, expect 403", () => {
          return request(app.getHttpServer())
            .get(ENDPOINT(validUsername))
            .set("Authorization", `Bearer ${invalidToken}`)
            .expect(401);
        });
      });
    });
  });
});

/**
 * Returns the decoded payload of a JWT
 *
 * @param   {string}            token  [token description]
 *
 * @return  {UserInfoResponse}         Viewable user information with JWT validity
 */
function parseJwt(token: string): UserInfoResponse {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64").toString());
  } catch (error) {
    return undefined;
  }
}
