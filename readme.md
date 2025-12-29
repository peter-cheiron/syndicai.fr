# syndic.fr

Welcome to the code home of the syndic AI project. This was built for the google/elenlabs hackathon.

The project is currently deployed at:

https://syndicai.fr

If you want access to the actual demo content then please contact me through the app itself or by email with a valid email and a reason as to why (if you are a judge for the hackathon for example)

https://syndicai.fr/contact

This is just to avoid costs.

## how does it work?

Simply put: using a structured model of a shared building this model is passed to an LLM in order to answer questions and perform tasks. The core prompt converts the answer into a structured response that can be used for information, translation, tasks, messages etc.

## Architecture

![architecture](/architecture.png)

## Let me run it ...

To run "chez toi" you need to provide a firebase project and deploy the functions that bridge the gap between the angular app and the services.

Currently you only need to deploy elevenlabs functions.

The app is angular running on firebase. Firebase is required as there are no mock alternatives for the moment. Enable:

- auth
- functions
- firebase
- storage
- vertex

## How was it built?

Its built from:

- angular
- tailwind
- firebase
- functions
