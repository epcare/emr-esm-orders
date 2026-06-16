declare namespace fhir {
  interface Identifier {
    use?: string;
    type?: {
      coding?: Array<Coding>;
      text?: string;
    };
    system?: string;
    value?: string;
    period?: Period;
    assigner?: Reference;
  }

  interface Coding {
    system?: string;
    version?: string;
    code?: string;
    display?: string;
    userSelected?: boolean;
  }

  interface CodeableConcept {
    coding?: Array<Coding>;
    text?: string;
  }

  interface Reference {
    reference?: string;
    type?: string;
    identifier?: Identifier;
    display?: string;
  }

  interface Quantity {
    value?: number;
    comparator?: string;
    unit?: string;
    system?: string;
    code?: string;
  }

  interface Range {
    low?: Quantity;
    high?: Quantity;
  }

  interface Period {
    start?: string;
    end?: string;
  }

  interface HumanName {
    use?: string;
    text?: string;
    family?: string;
    given?: Array<string>;
    prefix?: Array<string>;
    suffix?: Array<string>;
    period?: Period;
  }

  interface Resource {
    resourceType: string;
    id?: string;
    meta?: any;
    implicitRules?: string;
    language?: string;
    contained?: Array<Resource>;
    extension?: Array<any>;
    modifierExtension?: Array<any>;
  }

  interface DomainResource extends Resource {
    text?: any;
    contained?: Array<Resource>;
    extension?: Array<any>;
    modifierExtension?: Array<any>;
  }

  interface Patient extends DomainResource {
    resourceType: 'Patient';
    identifier?: Array<Identifier>;
    active?: boolean;
    name?: Array<HumanName>;
    gender?: string;
    birthDate?: string;
    deceased?: any;
    address?: Array<any>;
    maritalStatus?: CodeableConcept;
    multipleBirth?: any;
    photo?: Array<any>;
    contact?: Array<any>;
    communication?: Array<any>;
    generalPractitioner?: Array<Reference>;
    managingOrganization?: Reference;
    link?: Array<any>;
  }

  interface Observation extends DomainResource {
    resourceType: 'Observation';
    status?: string;
    category?: Array<CodeableConcept>;
    code?: CodeableConcept;
    subject?: Reference;
    focus?: Array<Reference>;
    encounter?: Reference;
    effectiveDateTime?: string;
    effectivePeriod?: Period;
    issued?: string;
    performer?: Array<Reference>;
    valueQuantity?: Quantity;
    valueCodeableConcept?: CodeableConcept;
    valueString?: string;
    valueBoolean?: boolean;
    valueInteger?: number;
    valueRange?: Range;
    valueRatio?: any;
    valueSampledData?: any;
    valueTime?: string;
    valueDateTime?: string;
    valuePeriod?: Period;
    dataAbsentReason?: CodeableConcept;
    interpretation?: Array<CodeableConcept>;
    note?: Array<any>;
    bodySite?: CodeableConcept;
    method?: CodeableConcept;
    specimen?: Reference;
    device?: Reference;
    referenceRange?: Array<any>;
    hasMember?: Array<Reference>;
    derivedFrom?: Array<Reference>;
    component?: Array<any>;
  }

  interface Location extends DomainResource {
    resourceType: 'Location';
    identifier?: Array<Identifier>;
    status?: string;
    name?: string;
    alias?: Array<string>;
    description?: string;
    mode?: string;
    type?: Array<CodeableConcept>;
    physicalType?: CodeableConcept;
    position?: {
      longitude?: number;
      latitude?: number;
      altitude?: number;
    };
    managingOrganization?: Reference;
    partOf?: Reference;
    hoursOfOperation?: Array<any>;
    availabilityExceptions?: string;
    endpoint?: Array<Reference>;
  }

  interface Encounter extends DomainResource {
    resourceType: 'Encounter';
    status?: string;
    statusHistory?: Array<any>;
    class?: any;
    classHistory?: Array<any>;
    type?: Array<CodeableConcept>;
    priority?: CodeableConcept;
    subject?: Reference;
    episodeOfCare?: Array<Reference>;
    participant?: Array<any>;
    appointment?: Reference;
    period?: Period;
    length?: any;
    reason?: Array<CodeableConcept>;
    diagnosis?: Array<any>;
    account?: Array<Reference>;
    hospitalization?: any;
    location?: Array<any>;
    serviceProvider?: Reference;
    partOf?: Reference;
  }

  interface Practitioner extends DomainResource {
    resourceType: 'Practitioner';
    identifier?: Array<Identifier>;
    active?: boolean;
    name?: Array<HumanName>;
    telecom?: Array<any>;
    address?: Array<any>;
    gender?: string;
    birthDate?: string;
    photo?: Array<any>;
    qualification?: Array<any>;
    communication?: Array<CodeableConcept>;
  }
}
