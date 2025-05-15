async function createSubscriber({ email, first_name, source }) {
  const url = `https://api.kit.com/v4/subscribers`
  const headers = {
    "Content-Type": 'application/json; charset="utf-8"',
    "X-Kit-Api-Key": process.env.CONVERTKIT_APIKEY_V4,
  }
  const bodyData = {
    email_address: email,
    first_name,
    state: "inactive",
    fields: {
      "Last name": "",
      Birthday: "1970-01-01",
      Source: source || "Swizec Integration",
    },
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(bodyData),
  })
  return await response.json()
}

async function signupSubscriber({ email, formId }) {
  const url = `https://api.kit.com/v4/forms/${formId}/subscribers`
  const headers = {
    "Content-Type": 'application/json; charset="utf-8"',
    "X-Kit-Api-Key": process.env.CONVERTKIT_APIKEY_V4,
  }
  const bodyData = {
    email_address: email,
    form_id: formId,
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(bodyData),
  })
  return await response.json()
}

export default async (request, response) => {
  //   const url = URL.parse(request.url, true)
  const data = JSON.parse(request.body)

  if (!data.email || !data.first_name || !data.formId) {
    response.status(400)
    response.json({ error: "Missing fields" })
    return
  }

  try {
    await createSubscriber(data)
    await signupSubscriber(data)

    response.status(200)
    response.send({})
  } catch (e) {
    response.status(500)
    response.json({ error: e })
  }
}
