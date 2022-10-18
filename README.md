# CS3219 OTOT Task C <!-- omit in toc -->

* **Name**: Yusuf Bin Musa
* **Matric. Number**: A0218228E
* **Repo Link**: [https://github.com/yusufaine/OTOT-C](https://github.com/yusufaine/OTOT-C)

## Task C: Authentication and Authorisation Task <!-- omit in toc -->

### Table of Content <!-- omit in toc -->

- [Motivation](#motivation)
- [Why NestJS instead of Express?](#why-nestjs-instead-of-express)
- [Routes Planning](#routes-planning)
  - [HTTP Error 401 Vs 403](#http-error-401-vs-403)
- [Requirements](#requirements)
- [Running the application](#running-the-application)
- [Implementation Summary](#implementation-summary)
  - [Authentication](#authentication)
  - [Authorisation](#authorisation)
- [Testing the application](#testing-the-application)
  - [Running Jest](#running-jest)
  - [Testing with Postman](#testing-with-postman)
  - [Credentials](#credentials)
  - [Jest Screenshot](#jest-screenshot)
- [Extending this task](#extending-this-task)

### Motivation

This application simulates authentication through the use of user logins and role-based authentication.

In the case of the `Public`, they can only successfully access `/`. This can be any arbitrary website that allows any visitor to only read its contents, this can be a messaging board like Reddit or a (non-paywalled) news website.

A `User` differs from `Public` as they are allowed to view information that's gated behind a login, this functions similar to social media platforms where a curated social feed is served to you based on your preference or the ability to view as many Medium articles as you desire.

The role of `Admin` here is used to illustrate that there are some actions that only an `Admin` can execute due to their elevated privilege while the public or a normal `User` can't. In this application, an `Admin` is allowed to view everyone's information (password is hashed as has been omitted out). In reality, an `Admin` is very likely to have full CRUD access over the application or infrastructure, which means that they would have the ability to remove or edit any resource such as removing bad actors from their system, or manually resetting another user's password.

To summarise, this report showcases how authentication and authorisation is implemented via JWT using the [NestJS](https://nestjs.com/). The example is simulated is a simple user database that allows users to login, view their own data, and view the data of others if the have enough authorisation.

<div style="page-break-after: always"></div>

### Why NestJS instead of Express?

1. NestJS is built on top of Express, and I wanted to explore what it offers.
2. Its integration with [JWT](https://docs.nestjs.com/security/authentication#jwt-functionality) and [role-based authentication](https://docs.nestjs.com/guards#role-based-authentication) is well-documented.
3. NestJS also nicely integrates with the popular Express-compatible authentication middleware, [Passport](https://github.com/jaredhanson/passport).
4. The structure enforced by NestJS' boilerplate-generation (`nest new <project_name>`) makes it easy to extend the application for all sorts of strategies.

### Routes Planning

| Route                | HTTP Code | Inputs                      | Role       | Response                     |
| -------------------- | --------- | --------------------------- | ---------- | ---------------------------- |
| `/`                  | 200       |                             | Public     | "Greetings EVERYONE!"        |
| `/auth/login`        | 201       | Valid user credentials      | Public     | Access token object          |
| `/auth/login`        | 401       | Invalid user credentials    | Public     | "Invalid credentials"        |
| `/me`                | 200       | Valid token                 | Admin/User | Own user info, token details |
| `/me`                | 401       | No token or invalid token   | Public     | "Unauthorized"               |
| `/profile/:username` | 200       | Valid token, role, username | Admin      | User info of username        |
| `/profile/:username` | 404       | Valid token, role,          | Admin      | "`username` not found"       |
| `/profile/:username` | 403       | Valid token, username       | User       | "Forbidden resource"         |
| `/profile/:username` | 401       | No token or invalid token   | Public     | "Unauthorized"               |

#### HTTP Error 401 Vs 403

This being the main point of the task can be broken down as such.

**Error 401** indicates that the request does not have valid credentials to access a certain resource. This is seen `/me` where no bearer token or an invalid one is given in the header of the request. This is one way to limit access to a resource from *unauthorised* users such as bad actors or public access in general.

On the other hand, **Error 403** indicates that the request is valid, meaning that they do have access to the resource, but does not have enough privilege to access, where privilege here is explored through role-based authentication. As seen in `/profile/:username`, anyone without the `admin` role would be met with an "Unauthorized" message as this resource works with the intention that admins can view the information of all users, excluding their passwords (which are hashed in the database).

<div style="page-break-after: always"></div>

### Requirements

1. NodeJS
2. NestJS
3. Jest (recommended, quick way to show that it's working)
4. Postman (easier to inspect requests)
   * You may refer to the collection [here](https://www.getpostman.com/collections/78c6d254164a5814562b).
   * Collection utilises `Test` to set the `Authorization` headers of a request through environmenet variables.

> A `Record<string,User>` is used in place of a database as this is a proof-of-concept and it makes it easier to test via `Jest`.

### Running the application

```bash
# Install dependencies
yarn

# Run the application
yarn start:dev # Hot reloads on change

```

The application is set to run on <http://localhost:3000>.

### Implementation Summary

#### Authentication

This is done by extending the `PassportStrategy` of `@nestjs/passport` and doing a simple validation to check if the provided `username` and `password` (via argon2's `verify` function) matches what is stored in the (mock) database. The `AuthGuard` decorator is also used to apply the need for authentication in `/auth/login`

Related files:

* [`src/auth/strategy/local.strategy.ts`](https://github.com/yusufaine/OTOT-C/blob/main/src/auth/strategy/local.strategy.ts)
  * enforces local login that matches the (mock) database,
* [`src/auth/auth.service.ts`](https://github.com/yusufaine/OTOT-C/blob/main/src/auth/auth.service.ts)
  * verifies that the given credentials are valid and sends a bearer token which also includes a user's role that can be used to access guarded routes.

<div style="page-break-after: always"></div>

#### Authorisation

Also utilising `AuthGuards` and `PassportStrategy` from `@nestjs/passport`, a JWT strategy is created to authorise requests with specific JWTs. Role-based authentication is then applied here by ensuring that the specified roles of certain routes are met to prevent unauthorised access.

Related files:

* [`src/auth/guard/has-roles.decorator.ts`](https://github.com/yusufaine/OTOT-C/blob/main/src/auth/guard/has-roles.decorator.ts)
  * sets which roles are allowed to access the routes that is has been decorated to
* [`src/auth/guard/roles.guard.ts`](https://github.com/yusufaine/OTOT-C/blob/main/src/auth/guard/roles.guard.ts)
  * verifies that the request has been authenticated and has the right roles to access the route from the attached bearer token

### Testing the application

Expected values of the tests are based on [Routes Planning](#routes-planning).

#### Running Jest

```bash
yarn test
```

#### Testing with Postman

| Request name            | Description                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `/`                     | Test that anyone can access this endpoint                                                                                        |
| `auth/login -- user`    | Logs in as `userBob`, returns access token which is set the collection variable `token` to test `me` and `profile/:username`     |
| `auth/login -- admin`   | Logs in as `adminAlice`, returns access token which is sets the collection variable `token` to test `me` and `profile/:username` |
| `auth/login -- invalid` | Logs in as `adminAlice`, **but** sets `token` with an invalid token                                                              |
| `me`                    | Returns the profile associated to the user if token is valid                                                                     |
| `profile/:username`     | Returns profile assocated to the given `username`, if token has `admin` role                                                     |

> **Note**: For demonstration purposes, `auth/login -- invalid` sets the `token` to "THIS_IS_INVALID".

#### Credentials

Here are the following credentials for the mock database:

| Username   | Password       | Role        |
| ---------- | -------------- | ----------- |
| adminAlice | alice_password | Admin, User |
| userBob    | bob_password   | User        |
| unknown    | unknown        | User        |

<div style="page-break-after: always"></div>

#### Jest Screenshot

![jest-image](https://i.ibb.co/DzW9kKT/image.png)

Refer to [`./test/app.e2e-spec.ts`](https://github.com/yusufaine/OTOT-C/blob/main/test/app.e2e-spec.ts) for the test details, or manually test with Postman with the collection [here](https://www.getpostman.com/collections/78c6d254164a5814562b).

### Extending this task

1. Refresh token
   * Currently the tokens are set to expire in 300 seconds.
   * Popular websites implement refresh tokens, typically through `/refresh`, to allow users to stay logged in to a website for an extended amount of time.
     * "Remember me for 30 days"
2. Explore other Passport [strategies](https://www.passportjs.org/packages/)
   * [Auth0 authentication](https://www.passportjs.org/packages/passport-auth0/)
   * [Simplify HTTP bearer](https://www.passportjs.org/packages/passport-http-bearer/)
   * [Github authentication](https://www.passportjs.org/packages/passport-github2/)
3. Explore `class-validator` and `class-transformer` to ensure that the proper login credentials are given.
   * Currently assumes that user would give according to what is needed.
   * Transform the password to its hashed version before sending the request as the password is currently being sent in plaintext.
