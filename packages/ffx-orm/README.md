# @oberan/ffx-orm

An _'ORM like'_ library for configuring Flatfile Workbooks.

## Inspiration

Configuration written is JSON is both error prone and hard to read. What if you could abstract all the complexities away into something more user friendly? `oberan/ffx-orm` was built using one of famous design patterns — the [builder pattern](https://en.wikipedia.org/wiki/Builder_pattern).

## Installing

Using npm:

```bash
npm install @oberan/ffx-orm
```

Using pnpm:

```bash
pnpm add @oberan/ffx-orm
```

Using yarn:

```bash
yarn add @oberan/ffx-orm
```

## Usage

```ts
import {
  BooleanFieldBuilder,
  CustomActionBuilder,
  SheetBuilder,
  TextFieldBuilder,
  WorkbookBuilder,
} from "@oberan/ffx-orm";

const firstName = new TextFieldBuilder("first_name", "First Name")
  .withDescription("Given name")
  .withRequired()
  .done();

const lastName = new TextFieldBuilder("last_name", "Last Name")
  .withDescription("Surname")
  .withRequired()
  .done();

const email = new TextFieldBuilder("email", "Email")
  .withDescription("Personal email address")
  .withRequired()
  .withUnique()
  .done();

const isSubscribed = new BooleanFieldBuilder("is_subscribed", "Is Subscribed?")
  .withDescription("Lead elected to receive marketing emails")
  .done();

const leads = new SheetBuilder("leads", "Leads")
  .withDescription("New inbound leads")
  .withField(firstName)
  .withField(lastName)
  .withField(email)
  .withField(isSubscribed)
  .done();

const submitAction = new CustomActionBuilder("submit_action", "Submit All Data")
  .withMode("foreground")
  .withNoInvalidRecords()
  .withPrimary()
  .withTooltip("Push everything to Mailchimp")
  .done();

const campaign = new WorkbookBuilder("2023 Q4 Campaign")
  .withCustomActions(submitAction)
  .withSheet(leads)
  .done();

// now you can deploy this workbook using an API client
api.workbooks.create(campaign);
```
