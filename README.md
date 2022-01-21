# In Case of my Death

The Application fulfills your last will by executing a workflow from your private repository on GitHub in case of your
death. Free from bias, blind to your secrets, cold-blooded as machine code.

https://www.incaseofmy.de/

## Who is it for

The App is intended primarily for programmers and software engineers who have an account on GitHub. Recently, the
workflow automation system [GitHub Actions](https://docs.github.com/en/actions) has gained great popularity, which this
App uses. However, anyone interested can create a workflow and use this App.

## How it works

- You create a workflow on GitHub
  - In a private repo for manual dispatch event.
- You grant access to the Application
  - Only the workflow run permissions needed.
- You activate communication channels
  - For example, authorize the Telegram bot.
- The App regularly communicates with you
  - You can customize how often this happens.
- You perform a simple action in response
  - Thus, you confirm that you are alive.
- If you don't respond in time...
  - The deadline is also customizable by you.
- The App executes the workflow
  - Considering you dead, it fulfills your last will.

## Safety concerns

The App does not read the contents of the repository and the workflow, but only initiates its launch in the specified
case. Moreover, you can use
[encrypted Action Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) in the GitHub
repository settings for sensitive information. Thus, the application is blind and impartial in relation to you, your
will and your secrets. The App is open source, so you can check this.

## Exceptional cases warning

The mechanism for determining the fact of death is not ideally accurate. There are exceptional cases when the App may
fulfill your last will while you are legally alive. For example, if you are unconscious, or you are in prison, or you
lost your phone, or for some other reason you do not have access to communication.

## Legal disclaimer

The App does not replace notarial certification of last will and other procedures established by the law of your country
for the official transfer of property and inheritance rights.

## How to create the workflow

[Create a new private repository on GitHub](https://github.com/new) in case you do not have one yet.

Commit the file `.github/workflows/my-last-will.yml` to the repository with a following content:

```yaml
name: Last will
on: workflow_dispatch
jobs:
  lastWill:
    runs-on: ubuntu-latest
    steps:
    - name: Tell my wife I love her
      uses: dawidd6/action-send-mail@v3.6.0
      with:
        server_address: smtp.mail.mail
        server_port: 465
        username: ${{ secrets.SMTP_LOGIN }}
        password: ${{ secrets.SMTP_PASSWORD }}
        from: Jane Doe <janedoe@mail.mail>
        to: mywife@mail.mail
        subject: My last will
        body: |
          Hello my darling. If you are reading
          these lines, I am most likely dead. In
          this regard, I want to inform you that 
          the years I lived with you were the
          happiest in my life. I love you more
          than schnitzel and potatoes. I am just
          kidding, sorry. To support you in this
          difficult moment, I leave you some
          money between the pages of The Hobbit
          book by J.R.R. Tolkien, which you will
          find in a drawer in my office. Do not
          be discouraged for too long and find
          for yourself someone alive, because
          you deserve to be happy anyway.
```
