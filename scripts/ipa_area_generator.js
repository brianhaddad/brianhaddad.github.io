function AreaGenerator() {
    this.generate = (level, biome, name) => {
        if (!biome) {
            biome = randomlyPickBiome();
        }
        const biomeKey = biomeNameToBiomeKey(biome);
        if (biomeKey !== null) {
            biomeCounts[biomeKey]++;
        }
        if (!name) {
            name = generateRandomName(level, biome);
        }

        return {
            level: level,
            biome: biome,
            name: name,
        };
    };

    const randomlyPickBiome = () => {
        let minCount = 100;
        for (const biome in biomeCounts) {
            if (biomeCounts[biome] < minCount) {
                minCount = biomeCounts[biome];
            }
        }
        const biomeHat = [];
        for (const biome in biomeCounts) {
            if (biomeCounts[biome] === minCount) {
                biomeHat.push(biome);
            }
        }
        const selection = biomeHat[Math.floor(Math.random() * biomeHat.length)];
        return biomes[selection];
    };

    const biomeNameToBiomeKey = (biomeName) => {
        for (const biome in biomes) {
            if (biomes[biome] === biomeName) {
                return biome;
            }
        }
        return null;
    };

    //TODO: populate with fun name components that can be removed as used to ensure every name is completely unique!
    const nameComponentsHat = [
        ``,
        ``,
    ];

    //TODO: if using randomly generated names, need to ensure each name is completely unique!
    const generateRandomName = (level, biome) => {
        //TODO: actually randoly generate some area names!
        return `Placeholder ${biome} (lvl: ${level})`;
    };
}

const areaGenerator = new AreaGenerator();