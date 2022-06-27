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
        let employeeTree = this.performEmployeeSearch(employeeID);
        if (employeeTree) {
            this.performSupervisorSearch(supervisorID, employeeTree.employee);
            let history = {
                parentId: employeeTree.parent.uniqueId,
                employeeId: employeeID,
                supervisorId: supervisorID,
                subordinates: employeeTree.employee.subordinates
            };
            this.clearSubordinates(employeeTree.employee);
            this.histories[++this.cursor] = history;
            this.histories.length = (this.cursor + 1);
        }
    }
    /**
     *
     * @param employee
     */
    clearSubordinates(employee) {
        employee.subordinates = [];
    }
    /**
     *
     * @param employeeID
     * @returns
     */
    performEmployeeSearch(employeeID) {
        let employeeTree = this.searchEmployee(this.ceo, employeeID);
        if (employeeTree) {
            employeeTree.parent.subordinates = this.removeEmployee(employeeTree.parent.subordinates, employeeTree.employee);
        }
        return employeeTree;
    }
    /**
     *
     * @param supervisorID
     * @param employee
     * @returns
     */
    performSupervisorSearch(supervisorID, employee) {
        let supervisor = this.searchEmployee(this.ceo, supervisorID);
        if (supervisor) {
            // asigning employee under supervisor 
            supervisor.employee.subordinates.push(employee);
        }
        return supervisor;
    }
    /** removes list of subordinates from parent employee node  */
    /**
     *
     * @param subordinates
     * @param employees
     */
    remove(subordinates, employees) {
        for (let employee of employees) {
            let index = subordinates.indexOf(employee);
            if (index != -1)
                subordinates.splice(index, 1);
        }
    }
    /** Undo last move action */
    undo() {
        if (this.cursor > -1) {
            let history = this.histories[this.cursor--];
            let employeeTree = this.performEmployeeSearch(history.employeeId);
            if (employeeTree) {
                let supervisorTree = this.performSupervisorSearch(history.parentId, employeeTree.employee);
                employeeTree.employee.subordinates = employeeTree.employee.subordinates.concat(history.subordinates);
                if (supervisorTree) {
                    this.remove(supervisorTree.employee.subordinates, history.subordinates);
                }
            }
        }
    }
    /** Redo last undone action */
    redo() {
        if (this.cursor + 1 < this.histories.length) {
            let history = this.histories[++this.cursor];
            let employeeTree = this.performEmployeeSearch(history.employeeId);
            if (employeeTree) {
                this.performSupervisorSearch(history.supervisorId, employeeTree.employee);
                this.clearSubordinates(employeeTree.employee);
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
    removeEmployee(subordinates, employee) {
        this.remove(subordinates, [employee]);
        return subordinates.concat(employee.subordinates);
    }
    /**
     *
     * @param parent
     * @param employeeID
     * @returns
     */
    searchEmployee(parent, employeeID) {
        for (var employee of parent.subordinates) {
            if (employee.uniqueId === employeeID) {
                return { employee, parent };
            }
            else {
                let employeeTree = this.searchEmployee(employee, employeeID);
                if (employeeTree)
                    return employeeTree;
            }
        }
    }
}
