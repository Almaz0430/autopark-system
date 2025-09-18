# Blueprint

## Overview

This document outlines the plan for integrating Firebase into the Next.js application. We will set up Firestore, Firebase Authentication (with Email and Password), and Firebase Cloud Messaging. We will also create a login/registration system with role-based redirects.

## Plan

1.  **Install Firebase SDK:** Add the `firebase` package to the project. (Done)
2.  **Initialize Firebase:** Configure Firebase with the project's credentials. (Done)
3.  **Set up Firestore:** Enable and configure Firestore. (Done)
4.  **Set up Authentication:** Configure Email/Password authentication. (Done)
5.  **Set up Cloud Messaging:** Configure Firebase Cloud Messaging. (Done)
6.  **Create Firebase Configuration:** Create a file at `src/lib/firebase.ts` to hold the Firebase configuration. (Done)
7.  **Create Firebase Provider:** Create a `FirebaseProvider.tsx` to make the Firebase instance available throughout the application. (Done)
8.  **Update Root Layout:** Wrap the application with the `FirebaseProvider`. (Done)

## Current Task: Authentication and Role-Based Redirects

1.  **Clean up `page.tsx`:** Remove the default Next.js starter content. (Done)
2.  **Create Authentication Form:** Create a new page at `src/app/auth/page.tsx` for user registration and login. (Done)
3.  **Implement Server Actions:** Create `src/app/auth/actions.ts` to handle user registration and login logic using Firebase Authentication. (Done)
4.  **Store User Data:** Upon registration, store the user's role in a `users` collection in Firestore. (Done)
5.  **Create Role-Based Dashboards:** Create placeholder pages for `driver`, `dispatcher`, and `admin` roles. (Done)
6.  **Implement Redirects:** After login, redirect users to their respective dashboards based on their roles. (Done)
