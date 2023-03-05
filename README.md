# DjangoReactStarter
### Backend

Setup python for dependencies:

Make virtual environment

`python3 -m venv venv`

`source venv/bin/activate` (do this every time you have a new terminal)

Install deps

`pip install -r requirements.txt`

Add api key

export OPENAI_API_KEY=...

Run server

`python manage.py runserver`

Test

`python manage.py test`

### Frontend

In react-website, run:

`yarn install` to setup once

Run `yarn run dev` to build for dev (live builds when code changes)

Or run `yarn run build` to build once for production
