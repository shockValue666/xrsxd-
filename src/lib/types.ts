import { z } from "zod";

export const FormSchema = z.object(
    {
        email:z.string().describe("Email").email({message:"Invalid Emaillllll"}),
        password:z.string().describe("Password").min(1,'Password is required')
    }
)

export const CreateWorkspaceFormSchema = z.object({
    workspaceName:z.string().describe("workspace name").min(1,"workspace name must be minimum of one character"),
    file: z.any()
})