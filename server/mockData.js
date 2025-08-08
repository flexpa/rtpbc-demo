export const mockPatient = {
  resourceType: "Patient",
  id: "example-patient-123",
  meta: {
    profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
  },
  identifier: [{
    system: "http://example.org/patient-id",
    value: "12345678"
  }],
  name: [{
    use: "official",
    family: "Demo",
    given: ["Test"]
  }],
  gender: "male",
  birthDate: "1980-01-01"
};

export const mockDICCoverage = {
  "resourceType": "Coverage",
  "id": "Example-Coverage1",
  "meta": {
    "versionId": "1",
    "lastUpdated": "2021-04-06T10:49:02.473+00:00",
    "profile": ["http://hl7.org/fhir/us/insurance-card/StructureDefinition/C4DIC-Coverage"]
  },
  "text": {
    "status": "generated",
    "div": "<div xmlns='http://www.w3.org/1999/xhtml'>Acme Gold Plus</div>'"
  },
  "extension": [
    {
      "extension": [
        {
          "url": "memberId",
          "valueId": "102345672-01"
        },
        {
          "url": "name",
          "valueHumanName": {
            "family": "Demo",
            "given": ["Test"]
          }
        }
      ],
      "url": "http://hl7.org/fhir/us/insurance-card/StructureDefinition/C4DIC-PlanBeneficiaries-extension"
    },
    {
      "url": "http://hl7.org/fhir/us/insurance-card/StructureDefinition/C4DIC-AdditionalCardInformation-extension",
      "valueAnnotation": {
        "text": "If you use a TTY, call 711.\nYou may be asked to present this card when you receive care or fill a perscription. This card does not gaurentee coverage."
      }
    },
    {
      "url": "http://hl7.org/fhir/us/insurance-card/StructureDefinition/C4DIC-CardIssueDate-extension",
      "valueDate": "2020-12-15"
    }
  ],
  "identifier": [
    {
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "MB",
            "display": "Member Number"
          }
        ]
      },
      "system": "https://www.acmeinsurance.com/glossary/memberid",
      "value": "102345672-01",
      "assigner": {
        "display": "Acme Insurance Co"
      }
    }
  ],
  "status": "active",
  "type": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "HIP",
        "display": "health insurance plan policy"
      }
    ],
    "text": "health insurance plan policy"
  },
  "subscriber": {
    "reference": "Patient/example-patient-123",
    "display": "Test Demo"
  },
  "subscriberId": "102345672-01",
  "beneficiary": {
    "reference": "Patient/example-patient-123",
    "display": "Test Demo"
  },
  "dependent": "01",
  "relationship": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/subscriber-relationship",
        "code": "self",
        "display": "Self"
      }
    ],
    "text": "Self"
  },
  "period": {
    "start": "2021-01-01"
  },
  "payor": [
    {
      "reference": "Organization/Example-PayerOrganization1",
      "display": "Acme Insurance Co"
    }
  ],
  "class": [
    {
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/coverage-class",
            "code": "group"
          }
        ]
      },
      "value": "993355",
      "name": "Stars Inc"
    },
    {
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/coverage-class",
            "code": "plan"
          }
        ]
      },
      "value": "11461128",
      "name": "Acme Gold Plus"
    },
    {
      "type": {
        "coding": [
          {
            "system": "http://hl7.org/fhir/us/insurance-card/CodeSystem/C4DICExtendedCoverageClassCS",
            "code": "division"
          }
        ]
      },
      "value": "11"
    },
    {
      "type": {
        "coding": [
          {
            "system": "http://hl7.org/fhir/us/insurance-card/CodeSystem/C4DICExtendedCoverageClassCS",
            "code": "network"
          }
        ]
      },
      "value": "561490",
      "name": "Acme Gold Plus South"
    },
    {
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/coverage-class",
            "code": "rxbin"
          }
        ]
      },
      "value": "100045"
    },
    {
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/coverage-class",
            "code": "rxpcn"
          }
        ]
      },
      "value": "1234000"
    },
    {
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/coverage-class",
            "code": "rxid"
          }
        ]
      },
      "value": "102345672-01"
    },
    {
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/coverage-class",
            "code": "rxgroup"
          }
        ]
      },
      "value": "GOLD2024"
    }
  ],
  "costToBeneficiary": [
    {
      "type": {
        "coding": [
          {
            "system": "http://hl7.org/fhir/us/insurance-card/CodeSystem/C4DICExtendedCopayTypeCS",
            "code": "FamOutDed",
            "display": "Family Out of Network Deductible"
          }
        ]
      },
      "valueMoney": {
        "value": 10000.00,
        "currency": "USD"
      }
    },
    {
      "type": {
        "coding": [
          {
            "system": "http://hl7.org/fhir/us/insurance-card/CodeSystem/C4DICExtendedCopayTypeCS",
            "code": "FamInDed",
            "display": "Family In Network Deductible"
          }
        ]
      },
      "valueMoney": {
        "value": 8000.00,
        "currency": "USD"
      }
    },
    {
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/coverage-copay-type",
            "code": "rx"
          }
        ]
      },
      "valueMoney": {
        "extension": [
          {
            "url": "http://hl7.org/fhir/us/insurance-card/StructureDefinition/C4DIC-BeneficiaryCostString-extension",
            "valueString": "DED THEN $10/$40/$70/25%"
          }
        ]
      }
    }
  ]
};

export const mockOrganization = {
  resourceType: "Organization",
  id: "Example-PayerOrganization1",
  identifier: [{
    system: "http://hl7.org/fhir/sid/us-npi",
    value: "1234567890"
  }],
  name: "Acme Insurance Co",
  type: [{
    coding: [{
      system: "http://terminology.hl7.org/CodeSystem/organization-type",
      code: "ins",
      display: "Insurance Company"
    }]
  }]
};

export const mockCapabilityStatement = {
  resourceType: "CapabilityStatement",
  status: "active",
  date: "2024-01-01",
  kind: "instance",
  fhirVersion: "4.0.1",
  format: ["json"],
  rest: [{
    mode: "server",
    security: {
      cors: true,
      service: [{
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/restful-security-service",
          code: "SMART-on-FHIR"
        }]
      }],
      extension: [{
        url: "http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris",
        extension: [
          {
            url: "authorize",
            valueUri: "http://localhost:3001/authorize"
          },
          {
            url: "token",
            valueUri: "http://localhost:3001/token"
          }
        ]
      }]
    },
    resource: [
      {
        type: "Patient",
        profile: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
        interaction: [
          { code: "read" },
          { code: "search-type" }
        ]
      },
      {
        type: "Coverage",
        profile: "http://hl7.org/fhir/us/insurance-card/StructureDefinition/C4DIC-Coverage",
        interaction: [
          { code: "read" },
          { code: "search-type" }
        ],
        searchParam: [
          {
            name: "patient",
            type: "reference"
          },
          {
            name: "_profile",
            type: "uri"
          }
        ]
      }
    ]
  }]
};

export const mockSmartConfiguration = {
  authorization_endpoint: "http://localhost:3001/authorize",
  token_endpoint: "http://localhost:3001/token",
  capabilities: [
    "launch-standalone",
    "client-public",
    "sso-openid-connect",
    "context-standalone-patient",
    "permission-patient"
  ],
  code_challenge_methods_supported: ["S256"],
  grant_types_supported: ["authorization_code"],
  scopes_supported: [
    "patient/Patient.read",
    "patient/Coverage.read",
    "launch",
    "launch/patient",
    "openid",
    "fhirUser"
  ]
};