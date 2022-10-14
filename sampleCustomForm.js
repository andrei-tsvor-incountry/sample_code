import { api, LightningElement, track } from 'lwc';
import { createRecord } from "lightning/uiRecordApi";

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import CASE_OBJECT from "@salesforce/schema/Case";

// schema fields
import FIELD_NAME_CONTACT_LAST_NAME from '@salesforce/schema/Contact.LastName';
import FIELD_NAME_CONTACT_FIRST_NAME from '@salesforce/schema/Contact.FirstName';

import FIELD_NAME_CONTACT_ID from '@salesforce/schema/Case.ContactId';
import FIELD_NAME_ACCOUNT_ID from '@salesforce/schema/Case.AccountId';

import FIELD_NAME_CASE_DESCRIPTION from '@salesforce/schema/Case.Description';
import FIELD_NAME_CASE_SUBJECT from '@salesforce/schema/Case.Subject';
import FIELD_NAME_CASE_COUNTRY_ORIGIN_FIELD from '@salesforce/schema/Case.CountryOrigin__c';

import FIELD_NAME_ACCOUNT_NAME from '@salesforce/schema/Account.Name';

const REQUESTED_ACCOUNT_FIELDS = [
    FIELD_NAME_ACCOUNT_NAME.fieldApiName,
];
const REQUESTED_CONTACT_FIELDS = [
    FIELD_NAME_CONTACT_LAST_NAME.fieldApiName,
    FIELD_NAME_CONTACT_FIRST_NAME.fieldApiName
];
const REQUESTED_CASE_FIELDS = [
    FIELD_NAME_CASE_SUBJECT.fieldApiName,
    FIELD_NAME_CASE_DESCRIPTION.fieldApiName,
];

export default class SampleCustomForm extends LightningElement {
    showSpinner = false;

    _newRecordId = '';
    _params = {};


    @track _incountryData = {};
    @track salesforceData = {};
    clearValues = {};


    @api
    storage = {};
    @api
    openModal = false;
    @api
    get params() {
        return this._params;
    }
    set params(value) {
        this._params = value;
        this.handleParams();
    }

    get incountryData() {
        return this._incountryData;
    }
    set incountryData(value) {
        this._incountryData = value;
    }

    get newRecordId() {
        return this._newRecordId;
    }
    set newRecordId(value) {
        this._newRecordId = value;
        this.writeInCountry();
    }

    handleClose() {
        this.openModal = false;
    }

    handleSave() {
        this.writeSalesforce();
        this.openModal = false;
    }

    handleParams() {
        this.fillSalesforceData();
        this.fillInCountryData();
    }

    handleChangeValue(event) {
        switch (event.target.dataset.id) {
            case 'subject-id':
                this.salesforceData.Subject = event.detail.value;
                this.incountryData.Subject = event.detail.value;
                break;
            case 'description-id':
                this.salesforceData.Description = event.detail.value;
                this.incountryData.Description = event.detail.value;
                break;
        }
    }

    fillSalesforceData() {
        if (this._params) {
            this.salesforceData = {
                ParentId: this._params.defaultFieldValues.ParentId,
                AccountId: this._params.defaultFieldValues.AccountId,
                ContactId: this._params.defaultFieldValues.ContactId,
                Description: this._params.defaultFieldValues.Description
            }
        }
    }

    fillInCountryData() {
        this.findInCountry();
    }

    writeSalesforce() {
        const fields = {};

        fields[FIELD_NAME_CONTACT_ID.fieldApiName] = this.salesforceData.ContactId;
        fields[FIELD_NAME_ACCOUNT_ID.fieldApiName] = this.salesforceData.AccountId;
        fields[FIELD_NAME_CASE_SUBJECT.fieldApiName] = this.salesforceData.Subject;
        fields[FIELD_NAME_CASE_DESCRIPTION.fieldApiName] = this.salesforceData.Description;
        fields[FIELD_NAME_CASE_COUNTRY_ORIGIN_FIELD.fieldApiName] = 'China'; // hardcoded value

        const recordInput = {
            apiName: CASE_OBJECT.objectApiName,
            fields: fields
        };

        createRecord(recordInput).then((record) => {
            console.log('NEW RECORD ID: ', JSON.stringify(record.id));
            this.newRecordId = record.id;
        });
    }

    writeInCountry() {
        this.storage
        .batchWrite([
            {
                recordId: this.newRecordId,
                payload: {
                    AccountId: this.salesforceData.AccountId,
                    ContactId: this.salesforceData.ContactId,
                    Subject: this.salesforceData.Subject,
                    Description: this.incountryData.Description
                }
            }
        ])
        .then(record => {
            console.log('WRITE InC RESPONSE: ', JSON.stringify(record));
        })
        .catch(error => {
            console.error(error);
        });
    }

    findInCountry() {
        let mapRecords = new Map([
            [this.salesforceData.ParentId , REQUESTED_CASE_FIELDS],
            [this.salesforceData.AccountId, REQUESTED_ACCOUNT_FIELDS],
            [this.salesforceData.ContactId, REQUESTED_CONTACT_FIELDS]
        ]);

        Array.from(mapRecords.keys()).forEach(key => {
            this.find(key, mapRecords.get(key));
        })
    }

    find(recordId, fields) {
        this.storage
        .find(
            [recordId],
            fields,
            1
        )
        .then(records => {
            this.prefillFormData(records);
        })
        .catch(error => {
            console.error(error);
        });
    }

    prefillFormData(records) {
        records.forEach(record => {
            if (record.service_key5 === 'Contact') {
                this.incountryData.ContactName = `${record.payload.FirstName} ${record.payload.LastName}`;
            }
            if (record.service_key5 === 'Account') {
                this.incountryData.AccountName = record.payload.Name;
            }
            if (record.service_key5 === 'Case') {
                this.incountryData.Description = record.payload.Description
            }
        })
    }
}