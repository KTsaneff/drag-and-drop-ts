//project state management class
class ProjectState {
    private listeners: any[] = [];
    private projects: any[] = [];
    private static instance: ProjectState;

    private constructor() {

    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new ProjectState();
        }        
        return this.instance
    }

    addListener(listenerFn: Function) {
        this.listeners.push(listenerFn);
    }

    addProject(title: string, desciption: string, numOfPeople: number) {
        const newProject = {
            id: crypto.randomUUID(),
            title: title,
            desciption: desciption,
            peopple: numOfPeople
        };

        this.projects.push(newProject);
        for(const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();

//validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLenght?: number;
    maxLenght?: number;
    min?: number;
    max?: number; 
}

function validate (validatableInput: Validatable) {
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

//autobind decorator
function autobind(
    _: any, 
    _2: string, 
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}

// project list class
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: any[];

    constructor (private type: 'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        this.assignedProjects = [];

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${type}-projects`;

        projectState.addListener((projects: any[]) => {
            this.assignedProjects = projects;
            this.renderProjects();
        });

        this.attach();
        this.renderContent();
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;

        for (const projItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = projItem.title;
            listEl?.appendChild(listItem);
        }
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
}

//project input class
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input';

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
        this.attach();
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value.trim();
        const enteredDescription = this.descriptionInputElement.value.trim();
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true,
            minLenght: 3,
            maxLenght: 20
        };

        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            maxLenght: 30
        };

        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        if (
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
        ) {
            alert('Invalid input, please try again!');
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople]
        }
    }

    private clearInputs () {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();

        if(Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            projectState.addProject(...userInput);
            console.log(title, desc, people);
            this.clearInputs();
        }
    }

    private configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');