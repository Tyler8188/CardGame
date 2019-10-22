var SkillAnim = {};
SkillAnim['0001'] = {
    'spell0':{frames:9,fps:8},
    'spell1':{frames:16,fps:8},
}

SkillAnim['0003'] = {
    'spell0':{frames:9,fps:8},
    'spell1':{frames:16,fps:8},
}


export default class SkillAnimConfig {
    public static getSkillInfo(skillId){
        return SkillAnim[skillId];
    }

}