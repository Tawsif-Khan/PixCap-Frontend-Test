"use strict";
class EmployeeOrgApp {
    /**
     *
     * @param ceo
     */
    constructor(ceo) {
        this.histories = [];
        this.cursor = -1;
        this.ceo = ceo;
    }
    /**
     *
     * @param employeeID
     * @param supervisorID
     */
    move(employeeID, supervisorID) {
        // finding employee and supervisor Object
        let { employee, parent } = this.searchEmployee(this.ceo, employeeID);
        parent.subordinates = this.removeEmployee(parent.subordinates, employee);
        let supervisor = this.searchEmployee(this.ceo, supervisorID);
        supervisor = supervisor.employee || supervisor.parent;
        // asigning employee under supervisor 
        supervisor.subordinates.push(employee);
        let history = {
            parentId: parent.uniqueId,
            employeeId: employeeID,
            supervisorId: supervisorID,
            subordinates: employee.subordinates
        };
        employee.subordinates = [];
        this.histories.push(history);
        this.cursor++;
    }
    /** removes list of subordinates from parent employee node  */
    /**
     *
     * @param subordinates
     * @param employees
     */
    remove(subordinates, employees) {
        for (let employee of employees) {
            subordinates.splice(subordinates.indexOf(employee), 1);
        }
    }
    /**
     *
     * @param employeeID
     * @param supervisorID
     * @returns
     */
    execute(employeeID, supervisorID) {
        /** finding employee and supervisor Object */
        let { employee, parent } = this.searchEmployee(this.ceo, employeeID);
        parent.subordinates = this.removeEmployee(parent.subordinates, employee);
        let supervisor = this.searchEmployee(this.ceo, supervisorID);
        /**  asigning employee under supervisor */
        supervisor = supervisor.employee || supervisor.parent;
        supervisor.subordinates.push(employee);
        return { employee, supervisor };
    }
    /** Undo last move action */
    undo() {
        if (this.cursor > -1) {
            let history = this.histories[this.cursor--];
            let { employee, supervisor } = this.execute(history.employeeId, history.parentId);
            employee.subordinates = employee.subordinates.concat(history.subordinates);
            this.remove(supervisor.subordinates, history.subordinates);
        }
    }
    /** Redo last undone action */
    redo() {
        if (this.cursor < this.histories.length) {
            let history = this.histories[++this.cursor];
            let { employee, supervisor } = this.execute(history.employeeId, history.supervisorId);
            employee.subordinates = [];
        }
    }
    /** remove subordinates from employe and added to parent employee  */
    /**
     *
     * @param subordinates
     * @param employee
     * @returns
     */
    removeEmployee(subordinates, employee) {
        subordinates.splice(subordinates.indexOf(employee), 1);
        return subordinates.concat(employee.subordinates);
    }
    /** search for employee object  */
    /**
     *
     * @param parent
     * @param employeeID
     * @returns
     */
    searchEmployee(parent, employeeID) {
        if (parent.uniqueId == employeeID) {
            return { employee: null, parent };
        }
        for (var employee of parent.subordinates) {
            if (employee.uniqueId === employeeID) {
                return { employee, parent };
            }
            else {
                employee = this.searchEmployee(employee, employeeID);
                if (employee)
                    return employee;
            }
        }
        return false;
    }
}
