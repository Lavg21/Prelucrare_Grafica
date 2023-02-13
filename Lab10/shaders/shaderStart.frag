#version 410 core

in vec3 fNormal;
in vec4 fPosEye;
in vec4 lightPosEye;
in vec2 fTexCoords;
in vec4 fragPosLightSpace;

out vec4 fColor;

uniform bool lightOn;
uniform bool fogOn;

//lighting
uniform	vec3 lightDir;
uniform	vec3 lightColor;

//texture
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;
uniform sampler2D shadowMap;

vec3 ambient;
vec3 diffuse;
vec3 specular;

float ambientStrength = 0.2f;
float specularStrength = 0.5f;
float shininess = 32.0f;
float shadow;

float constant = 1.0f;
float linear = 0.7f;
float quadratic = 0.8f;

void computeLightComponents()
{		
	vec3 cameraPosEye = vec3(0.0f);//in eye coordinates, the viewer is situated at the origin
	
	// Transform normal
	vec3 normalEye = normalize(fNormal);	
	
	// Compute light direction
	vec3 lightDirN = normalize(lightDir);
	
	// Compute view direction 
	vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);
		
	// Compute ambient light
	ambient = ambientStrength * lightColor;
	
	// Compute diffuse light
	diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;
	
	// Compute specular light
	vec3 reflection = reflect(-lightDirN, normalEye);
	float specCoeff = pow(max(dot(viewDirN, reflection), 0.0f), shininess);
	specular = specularStrength * specCoeff * lightColor;
}

void computeLightOn()
{		
	vec3 cameraPosEye = vec3(0.0f);//in eye coordinates, the viewer is situated at the origin
	
	// Transform normal
	vec3 normalEye = normalize(fNormal);	
	
	// Compute light direction
	vec3 lightDirN = normalize(lightPosEye.xyz - fPosEye.xyz);
	
	// Compute view direction 
	vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);
		
	// Compute half vector
    	vec3 halfVector = normalize(lightDirN + viewDirN);

	// Compute distance to light
   	float dist = length(lightPosEye.xyz - fPosEye.xyz);

   	// Compute attenuation
   	float att = 1.0f / (constant + linear * dist + quadratic * (dist * dist));

	// Compute ambient light
    	ambient = att * ambientStrength * lightColor;

    	// Compute diffuse light
    	diffuse = att * max(dot(normalEye, lightDirN), 0.0f) * lightColor;

	// Compute specular light
	vec3 reflection = reflect(-lightDirN, normalEye);
	float specCoeff = pow(max(dot(viewDirN, reflection), 0.0f), shininess);
    	specular = att * specularStrength * specCoeff * lightColor;

}

float computeShadow()
{
	// Perform perspective divide
	vec3 normalizedCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
	
	// Transform to [0,1] range
	normalizedCoords = normalizedCoords * 0.5 + 0.5;
	
	if (normalizedCoords.z > 1.0f)
		return 0.0f;

	// Get closest depth value from light's perspective
	float closestDepth = texture(shadowMap, normalizedCoords.xy).r;
	
	// Get depth of current fragment from light's perspective
	float currentDepth = normalizedCoords.z;
	
	// Check whether current frag pos is in shadow
	float bias = 0.005f;
	float shadow = currentDepth - bias > closestDepth ? 1.0f : 0.0f;

	return shadow;
}

float computeFog()
{
 	float fogDensity = 0.05f;
 	float fragmentDistance = length(fPosEye);
 	float fogFactor = exp(-pow(fragmentDistance * fogDensity, 2));
 
 	return clamp(fogFactor, 0.0f, 1.0f);
}

void main() 
{
	computeLightComponents();

	if(lightOn==true){
		computeLightOn();
	}
	
	vec3 baseColor = vec3(0.9f, 0.35f, 0.0f);//orange
	
	ambient *= texture(diffuseTexture, fTexCoords).rgb;
	diffuse *= texture(diffuseTexture, fTexCoords).rgb;
	specular *= texture(specularTexture, fTexCoords).rgb;
	
	//modulate with shadow
	shadow = computeShadow();
	vec3 color = min((ambient + (1.0f - shadow)*diffuse) + (1.0f - shadow)*specular, 1.0f);
    
	// Fog
	float fogFactor = computeFog();
	vec4 fogColor = vec4(0.5f, 0.5f, 0.5f, 1.0f);

	fColor = mix(fogColor, vec4(color,1), fogFactor);

    	//fColor = vec4(color, 1.0f);
}
