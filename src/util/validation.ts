namespace App {

    export interface Validatable {
        value: string | number;
        required?: boolean;
        minLenght?: number;
        maxLenght?: number;
        min?: number;
        max?: number; 
    }

    export function validate (validatableInput: Validatable) {
        let isValid = true;

        if(validatableInput.required) {
            isValid = isValid && validatableInput.value.toString().trim().length !== 0;
        }
        if (validatableInput.minLenght != null && typeof validatableInput.value === 'string') {
            isValid = isValid && validatableInput.value.trim().length >= validatableInput.minLenght;
        }
        if(validatableInput.maxLenght != null && typeof validatableInput.value === 'string') {
            isValid = isValid && validatableInput.value.trim().length <= validatableInput.maxLenght;
        }
        if(validatableInput.min != null && typeof validatableInput.value === 'number') {
            isValid = isValid && validatableInput.value >= validatableInput.min;
        }
        if(validatableInput.max != null && typeof validatableInput.value === 'number') {
            isValid = isValid && validatableInput.value <= validatableInput.max;
        }

        return isValid;
    }
}