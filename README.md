# CS3219 OTOT Task C

* **Name**: Yusuf Bin Musa
* **Matric. Number**: A0218228E
* **Repo Link**: [https://github.com/yusufaine/OTOT-C](https://github.com/yusufaine/OTOT-C)

## Task C: Authentication and Authorisation Task

This report mainly showcases how authentication and authorisation is implemented via JWT using the [NestJS](https://nestjs.com/). The example that would be simulated is a simple user database that allows users to login, view their own data, and view the data of others if the have enough authorisation (more details in).

### Table of Content
<!-- no toc -->
* [Table of Content](#table-of-content)
* [NestJS or Express?](#nestjs-or-express)
* [Routes Planning](#routes-planning)
  * [HTTP Error 401 Vs 403](#http-error-401-vs-403)
* [Requirements](#requirements)
* [Running the application](#running-the-application)
* [Testing the application](#testing-the-application)
  * [Jest Screenshot](#jest-screenshot)
* [Extending this task](#extending-this-task)

### NestJS or Express?

NestJS was chosen over Express as:

1. NestJS is built on top of Express, and I wanted to explore what it offers.
2. Its integration with [JWT](https://docs.nestjs.com/security/authentication#jwt-functionality) and [Role-based Authentication (RBAC)](https://docs.nestjs.com/guards#role-based-authentication) is well-documented.
3. NestJS also nicely integrates with the popular Express-compatible authentication middleware, [Passport](https://github.com/jaredhanson/passport).
4. The structure enforced by NestJS' boilerplate-generation (`nest new <project_name>`) makes it easy to extend the application for all sorts of strategies.

### Routes Planning

| Route                | HTTP Code | Inputs                      | Role       | Response                     |
| -------------------- | --------- | --------------------------- | ---------- | ---------------------------- |
| `/`                  | 200       |                             | Public     | "Greetings EVERYONE!"        |
| `/auth/login`        | 201       | Valid user credentials      | Admin/User | Access token object          |
| `/auth/login`        | 401       | Invalid user credentials    | Admin/User | "Invalid credentials"        |
| `/me` / `/profile`   | 200       | Valid token                 | Admin/User | Own user info, token details |
| `/me` / `/profile`   | 401       | Invalid token               | Public     | "Unauthorized"               |
| `/profile/:username` | 200       | Valid token, role, username | Admin      | User info of username        |
| `/profile/:username` | 404       | Valid token, role,          | Admin      | "`username` not found"       |
| `/profile/:username` | 403       | Valid token, username       | User/      | "Forbidden resource"         |
| `/profile/:username` | 401       | Invalid token               | Public     | "Unauthorized"               |

#### HTTP Error 401 Vs 403

This being the main point of the task can be broken down as such.

**Error 401** indicates that the request does not have valid credentials to access a certain resource. This is seen `/me` where no bearer token or an invalid one is given in the header of the request. This is one way to limit access to a resource from *unauthorised* users such as bad actors or public access in general.

On the other hand, **Error 403** indicates that the request is valid, meaning that they do have access to the resource, but does not have enough privilege to access, where privilege here is explored through RBAC. As seen in `/profile/:username`, anyone without the `admin` role would be met with an "Unauthorized" message as this resource works with the intention that admins can view the info of all users, excluding their passwords (which are hashed in the database).

### Requirements

1. NodeJS
2. NestJS
3. Jest (recommended)
4. Postman (optional)
   * You may refer to the collection [here](https://www.getpostman.com/collections/78c6d254164a5814562b). However, as cookies are **not** used, testing this Postman would mean that you would need to manually copy over the `access-token` into the header with the following values:
     * `key`: `Authorization`
     * `value`: `Bearer <access-token-value>`

> A `Record<string,User>` is used in place of a database as this is a proof-of-concept and it makes it easier to test via `Jest`.

### Running the application

```bash

# Install dependencies
yarn

# Run the application
yarn start:dev # Hot reloads on change

```

The application is set to run on <http://localhost:3000>.

### Testing the application

```bash
yarn test
```

#### Jest Screenshot

![jest-image](https://i.ibb.co/5WPvv6r/image.png)

Refer to `./test/app.e2e-spec.ts` for the test details, or manually test with Postman with the collection [here](https://www.getpostman.com/collections/78c6d254164a5814562b)

### Extending this task

1. Refresh token
   * Currently the tokens are set to expire in 300 seconds regardless.
   * Popular websites implement refresh tokens, typically through `/refresh`, to allow users to stay logged in to a website for an extended amount of time
     * "Remember me for 30 days"
2. Explore other Passport [strategies](https://www.passportjs.org/packages/)
   * [Auth0 authentication](https://www.passportjs.org/packages/passport-auth0/)
   * [Simplify HTTP bearer](https://www.passportjs.org/packages/passport-http-bearer/)
   * [Github authentication](https://www.passportjs.org/packages/passport-github2/)
