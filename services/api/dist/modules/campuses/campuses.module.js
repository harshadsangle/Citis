"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampusesModule = void 0;
const common_1 = require("@nestjs/common");
const campuses_controller_1 = require("./campuses.controller");
const campuses_service_1 = require("./campuses.service");
let CampusesModule = class CampusesModule {
};
exports.CampusesModule = CampusesModule;
exports.CampusesModule = CampusesModule = __decorate([
    (0, common_1.Module)({ controllers: [campuses_controller_1.CampusesController], providers: [campuses_service_1.CampusesService] })
], CampusesModule);
//# sourceMappingURL=campuses.module.js.map