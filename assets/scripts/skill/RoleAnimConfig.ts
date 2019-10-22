var RoleAnim = {}
RoleAnim['0001'] = {
    'attack':{frames:8,fps:8},
    'attacked':{frames:8,fps:8},
    'combat_idle':{frames:4,fps:8},
    'idle':{frames:4,fps:8},
    'ride_idle':{frames:4,fps:8},
    'ride_run':{frames:8,fps:8},
    'run':{frames:8,fps:8},
    'rush':{frames:1,fps:8},
    'spell1':{frames:8,fps:8},
    'spell2':{frames:8,fps:8},
    'spell3':{frames:14,fps:8},
    'spell4':{frames:8,fps:8},
    'spell5':{frames:4,fps:8},
    'spell6':{frames:10,fps:8},
}

RoleAnim['0003'] = {
    'attack':{frames:8,fps:8},
    'attacked':{frames:8,fps:8},
    'combat_idle':{frames:4,fps:8},
    'idle':{frames:4,fps:8},
    'ride_idle':{frames:4,fps:8},
    'ride_run':{frames:8,fps:8},
    'run':{frames:8,fps:8},
    'rush':{frames:1,fps:8},
    'spell1':{frames:8,fps:8},
    'spell2':{frames:8,fps:8},
    'spell3':{frames:14,fps:8},
    'spell4':{frames:8,fps:8},
    'spell5':{frames:8,fps:8},
    'spell6':{frames:12,fps:8},
}

export default class RoleAnimConfig {
    public static getRoleInfo(roleId){
        return RoleAnim[roleId];
    }

}
