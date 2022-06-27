
interface Employee {
    uniqueId: number;
    name: string;
    subordinates: Employee[];
}

interface History {
    parentId: number,
    employeeId: number,
    supervisorId: number,
    subordinates: Employee[]
}

interface EmployeeTree {
    parent: Employee,
    employee: Employee
}

interface IEmployeeOrgApp {
    ceo: Employee
    /**
    * Moves the employee with employeeID (uniqueId) under a supervisor
    (another employee) that has supervisorID (uniqueId).
    * E.g. move Bob (employeeID) to be subordinate of Georgina
    (supervisorID). * @param employeeID
    * @param supervisorID
    */
    move(employeeID: number, supervisorID: number): void;
    /** Undo last move action */
    undo(): void;
    /** Redo last undone action */
    redo(): void;
}


class EmployeeOrgApp implements IEmployeeOrgApp {
    ceo: Employee;
    histories: History[] = []
    cursor: number = -1

    /**
     * 
     * @param ceo 
     */
    constructor(ceo: Employee) {
        this.ceo = ceo

    }
    /**
     * 
     * @param employeeID 
     * @param supervisorID 
     */
    move(employeeID: number, supervisorID: number): void {

        let employeeTree = this.performEmployeeSearch(employeeID)
        if (employeeTree) {
            this.performSupervisorSearch(supervisorID, employeeTree.employee)

            let history = {
                parentId: employeeTree.parent.uniqueId,
                employeeId: employeeID,
                supervisorId: supervisorID,
                subordinates: employeeTree.employee.subordinates
            } as History

            this.clearSubordinates(employeeTree.employee)
            this.histories[++this.cursor] = history
            this.histories.length = (this.cursor + 1)


        }
    }

    /**
     * 
     * @param employee 
     */
    clearSubordinates(employee: Employee): void {
        employee.subordinates = []
    }

    /**
     * 
     * @param employeeID 
     * @returns 
     */
    performEmployeeSearch(employeeID: number): EmployeeTree | undefined {
        let employeeTree = this.searchEmployee(this.ceo, employeeID)


        if (employeeTree) {
            employeeTree.parent.subordinates = this.removeEmployee(employeeTree.parent.subordinates, employeeTree.employee)
        }
        return employeeTree
    }

    /**
     * 
     * @param supervisorID 
     * @param employee 
     * @returns 
     */
    performSupervisorSearch(supervisorID: number, employee: Employee): EmployeeTree | undefined {
        let supervisor = this.searchEmployee(this.ceo, supervisorID)

        if (supervisor) {
            // asigning employee under supervisor 
            supervisor.employee.subordinates.push(employee)
        }

        return supervisor
    }

    /** removes list of subordinates from parent employee node  */
    /**
     * 
     * @param subordinates 
     * @param employees 
     */
    remove(subordinates: Employee[], employees: Employee[]): void {

        for (let employee of employees) {
            let index = subordinates.indexOf(employee)
            if (index != -1)
                subordinates.splice(index, 1)
        }
    }


    /** Undo last move action */
    undo(): void {

        if (this.cursor > -1) {

            let history = this.histories[this.cursor--]

            let employeeTree = this.performEmployeeSearch(history.employeeId)
            if (employeeTree) {
                let supervisorTree = this.performSupervisorSearch(history.parentId, employeeTree.employee)

                employeeTree.employee.subordinates = employeeTree.employee.subordinates.concat(history.subordinates)

                if (supervisorTree) {
                    this.remove(supervisorTree.employee.subordinates, history.subordinates)
                }
            }
        }
    }

    /** Redo last undone action */
    redo(): void {
        if (this.cursor + 1 < this.histories.length) {
            let history = this.histories[++this.cursor]
            let employeeTree = this.performEmployeeSearch(history.employeeId)
            if (employeeTree) {
                this.performSupervisorSearch(history.supervisorId, employeeTree.employee)

                this.clearSubordinates(employeeTree.employee)

            }
        }
    }

    /** remove subordinates from employe and added to parent employee  */
    /**
     * 
     * @param subordinates 
     * @param employee 
     * @returns 
     */
    removeEmployee(subordinates: Employee[], employee: Employee): Employee[] {
        this.remove(subordinates, [employee])
        return subordinates.concat(employee.subordinates)
    }


    /**
     * 
     * @param parent 
     * @param employeeID 
     * @returns 
     */
    searchEmployee(parent: Employee, employeeID: number): EmployeeTree | undefined {

        for (var employee of parent.subordinates) {
            if (employee.uniqueId === employeeID) {
                return { employee, parent }
            } else {
                let employeeTree = this.searchEmployee(employee, employeeID)
                if (employeeTree)
                    return employeeTree
            }
        }

    }
}

