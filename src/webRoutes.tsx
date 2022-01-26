import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import PPopup from "./page"
export function WebRoutes() {
    return <Router>
        <Switch>
            <Route exact path={"/"} component={PPopup}>

            </Route>
        </Switch>
    </Router>
}