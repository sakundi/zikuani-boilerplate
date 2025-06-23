const backendUrl = 'https://passport-dev.sakundi.io';
const userId = 'andres.gomez@sakundi.io';

const body = {
  "data": {
    "id": userId,
    "type": "user",
    "attributes": {
      "age_lower_bound": 18,
      "uniqueness": true,
      "nationality": "COL",
      "nationality_check": true,
      "event_id": "111111111111111111111111111111",
    }
  }
};

async function runVerification() {
  try {
    // Step 1: Request verification link
    const response1 = await fetch(
      `${backendUrl}/integrations/verificator-svc/private/verification-link`,
      {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    console.log(response1);

    if (!response1.ok) {
      throw new Error(`Failed to get verification link: ${response1.status}`);
    }

    const { data: linkData } = await response1.json();
    const proofParamsUrl = linkData.attributes.get_proof_params;

    console.log("✅ Proof Params URL:", proofParamsUrl);

    // Step 2: Check verification status
    const encodedUserId = encodeURIComponent(userId);
    const response2 = await fetch(`${proofParamsUrl}`);

    if (!response2.ok) {
      throw new Error(`Failed to get verification status: ${response2.status}`);
    }

    const { data: proofParams } = await response2.json();

    console.log("proofParams: ");
    console.log(proofParams);

  } catch (err) {
    console.error("❌ Error during verification:", err);
  }
}

runVerification();
