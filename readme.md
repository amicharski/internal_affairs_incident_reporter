## IAIR

This is an application used by the Interal Affairs to keep track of cases of staff abuse.

There are three stages to a report:
1. Unopened: The report has been filed but an IA member has not looked into it yet.
2. Investigating: An IA member has opened the report and has been assigned to investigate it.
3. Resolved: The report has been resolved by the IA member responsible for investigating it.

There are several user roles in this application:
0. Suspended: A user account that does not have access to the IAIR portal.
1. General Staff (NOT ACTIVATED): A user account that must have their password changed (by default, new accounts that are created become this role).
2. General Staff: A general staff member. They only have the ability to file reports.
3. Internal Affairs: An IA staff member. They can do everything that 2 can do, plus investigate and resolve reports, and view staff and change a staff member's role from 0 to 2.
4. Administrator: An administrator (Grand Inquisitor and Engineering Team members with production access). They can do everything that 3 can do, plus create new accounts and change a staff member's role to 3.

## Setup

1. `git clone` this repository.
2. Install MongoDB Compass on your local machine.
3. Create a database and name it "iair_dev".
4. Create a collection and name it "Users".
5. Create and configure a `.env` file in the parent directory like this:
```
DB_URL="mongodb://127.0.0.1:27017"
DB_NAME="iair_dev"
VERSION=1.01-ALPHA
PORT=8080
```
